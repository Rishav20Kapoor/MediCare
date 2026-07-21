import 'dotenv/config';
import { connectDB } from '../config/db.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt';

async function run() {
  const [,, email, newPassword] = process.argv;
  if (!email || !newPassword) {
    console.error('Usage: node scripts/resetDoctorPassword.js <email> <newPassword>');
    process.exit(1);
  }

  await connectDB();

  try {
    const emailLC = String(email).trim().toLowerCase();
    const hash = await bcrypt.hash(newPassword, 10);
    const updated = await Doctor.findOneAndUpdate(
      { email: emailLC },
      { $set: { password: hash } },
      { new: true, select: '+password' },
    );

    if (!updated) {
      console.error('Doctor not found for', emailLC);
      process.exit(2);
    }

    console.log(`Password updated for ${emailLC}.`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(3);
  }
}

run();
