import { NextApiRequest, NextApiResponse } from "next";

// Mock DB function — replace with real DB logic
const createBooking = async (data: {
  userId: number;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}) => {
  const bookingId = Math.floor(Math.random() * 100000); // simulate ID
  return { bookingId };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userId, roomId, checkInDate, checkOutDate, numberOfGuests } = req.body;

  if (!userId || !roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  try {
    const { bookingId } = await createBooking({
      userId,
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
    });

    return res.status(200).json({ bookingId });
  } catch (error) {
    console.error("Booking error:", error);
    return res.status(500).json({ message: "Server error while creating booking" });
  }
}

