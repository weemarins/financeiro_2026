import * as authService from '../services/authService.js';

export async function register(req, res) {
  try {
    const { name, email, password, familyId } = req.body;

    if (!name || !email || !password || !familyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userId = await authService.registerUser(familyId, name, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      userId
    });
  } catch (error) {
    if (error.message.includes('Email already registered')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { token, user } = await authService.loginUser(email, password);

    res.json({
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const userId = req.user.userId;
    const familyId = req.user.familyId;

    await authService.updateUser(userId, { name, email }, familyId);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    await authService.changePassword(userId, currentPassword, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

export async function getFamilyUsers(req, res) {
  try {
    const familyId = req.user.familyId;
    const users = await authService.getFamilyUsers(familyId);

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createFamilyUser(req, res) {
  try {
    const familyId = req.user.familyId;
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedRole = role === 'admin' ? 'admin' : 'member';
    const userId = await authService.createFamilyUser(familyId, name, email, password, normalizedRole);

    res.status(201).json({
      message: 'User created successfully',
      userId
    });
  } catch (error) {
    if (error.message.includes('Email already registered')) {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

export async function updateFamilyUser(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = Number(req.params.id);
    const { name, email, role, is_active } = req.body;

    const normalizedRole = role === 'admin' ? 'admin' : 'member';
    const isActiveValue = typeof is_active === 'boolean' ? is_active : true;

    const updated = await authService.updateUser(
      userId,
      { name, email, role: normalizedRole, is_active: isActiveValue },
      familyId
    );

    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function deleteFamilyUser(req, res) {
  try {
    const familyId = req.user.familyId;
    const requesterId = req.user.userId;
    const userId = Number(req.params.id);

    await authService.deleteFamilyUser(userId, familyId, requesterId);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error.message.includes('User not found')) {
      return res.status(404).json({ error: error.message });
    }

    if (
      error.message.includes('cannot delete your own user') ||
      error.message.includes('family must have at least one admin')
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
  }
}
