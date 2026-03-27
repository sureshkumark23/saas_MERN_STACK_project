const express = require('express');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Set up the Email Transporter using your Gmail credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route   GET /api/team
// @desc    Get all members of the current workspace
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find all users who have this workspace ID in their workspaces array
    const teamMembers = await User.find({ workspaces: req.user.tenantId }).select('-password');
    res.json(teamMembers);
  } catch (err) {
    console.error("Fetch Team Error:", err);
    res.status(500).json({ message: 'Server error while fetching team' });
  }
});

// @route   POST /api/team/invite
// @desc    Invite a user and send an email
router.post('/invite', authMiddleware, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // 1. Get the Inviter's details and Workspace details for the email
    const inviter = await User.findById(req.user.id);
    const workspace = await Tenant.findById(req.user.tenantId);

    if (!inviter || !workspace) {
      return res.status(404).json({ message: 'User or Workspace not found' });
    }

    // 2. Check if the invited user already has an account
    let invitedUser = await User.findOne({ email });

    if (invitedUser) {
      // If they exist, silently add this workspace to their account
      if (!invitedUser.workspaces.includes(workspace._id)) {
        invitedUser.workspaces.push(workspace._id);
        // We will respect their existing role, or you can build logic to update it
        await invitedUser.save();
      }
    } else {
      // NOTE: For a real production app, you would create a "Pending Invite" token here.
      // For this MVP, we will just send them the email so they can go register themselves!
    }

    // 3. Compose the HTML Email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const mailOptions = {
      from: `"Acme Corp" <${process.env.EMAIL_USER}>`, // Sender address
      to: email, // Receiver address
      subject: `You've been invited to join ${workspace.name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #111827;">Hello ${name},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            <strong>${inviter.name}</strong> has invited you to collaborate in the <strong>${workspace.name}</strong> workspace!
          </p>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
            You have been assigned the role of <span style="background-color: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 4px; font-weight: bold; text-transform: capitalize;">${role}</span>.
          </p>
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
            <a href="${frontendUrl}/login" style="background-color: #3b66f5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; text-align: center;">
            If you don't have an account yet, simply create one using this email address and you will see the workspace immediately!
          </p>
        </div>
      `
    };

    // 4. Send the Email!
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Invitation sent successfully!' });
  } catch (err) {
    console.error("Invite Error:", err);
    res.status(500).json({ message: 'Failed to send invitation email.' });
  }
});

module.exports = router;