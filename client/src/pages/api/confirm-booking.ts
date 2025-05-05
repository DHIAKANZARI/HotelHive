import { NextApiRequest, NextApiResponse } from "next";

// Mock DB update — replace with your DB logic
const confirmBooking = async (bookingId: number) => {
  console.log(`Booking ${bookingId} confirmed`);
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ message: "Missing bookingId" });
  }

  try {
    const success = await confirmBooking(bookingId);
    return res.status(200).json({ success });
  } catch (error) {
    console.error("Confirmation error:", error);
    return res.status(500).json({ message: "Failed to confirm booking" });
  }
}
