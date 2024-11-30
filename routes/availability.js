// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');
// const Availability = require('../models/availability'); // Import the Availability model
// const MentorProfile = require('../models/mentorProfile'); // Import the MentorProfile model
// const User = require('../models/users'); // Import the User model

// // Helper function to check if a slot is already taken
// const isSlotTaken = async (userId, slot) => {
//   // Check if the slot is already taken by querying the Availability model
//   const availability = await Availability.findOne({ userId: new mongoose.Types.ObjectId(userId) });
//   if (availability && availability.slots.includes(slot)) {
//     return true; // Slot is already taken
//   }
//   return false; // Slot is available
// };

// // POST route to create or add availability for a mentor
// router.post('/:userId', async (req, res) => {
//   const { userId } = req.params; // Get the userId from the URL parameter
//   const { slots } = req.body;

//   console.log(`Received POST request for userId: ${userId} with slots: ${slots}`);

//   // Validate slots input
//   if (!slots || !Array.isArray(slots) || slots.length === 0) {
//     return res.status(400).json({ msg: 'Please provide an array of time slots with at least one slot.' });
//   }

//   try {
//     // Ensure userId is passed correctly and in a valid ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ msg: 'Invalid userId' });
//     }

//     // Ensure the user exists
//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ msg: 'User not found' });
//     }

//     // Resolve userId to the mentor's ObjectId
//     const mentorProfile = await MentorProfile.findOne({
//       $or: [{ _id: userId }, { user: userId }],
//     });

//     console.log('Resolved Mentor Profile:', mentorProfile);

//     if (!mentorProfile) {
//       return res.status(404).json({ msg: 'Mentor profile not found' });
//     }

//     // Use the resolved userId directly (mentor profile user field)
//     const mentorId = mentorProfile.user; // Use the `user` field from mentorProfile (this is the userId)

//     // Check if any of the new slots are already taken
//     for (let slot of slots) {
//       const isTaken = await isSlotTaken(mentorId, slot);
//       if (isTaken) {
//         return res.status(400).json({ msg: `Slot '${slot}' is already taken.` });
//       }
//     }

//     // Find existing availability for the mentor
//     let availability = await Availability.findOne({
//       userId: new mongoose.Types.ObjectId(mentorId), // Correct field name
//     });

//     // If availability exists, add the new slots to the existing slots
//     if (availability) {
//       const updatedSlots = [...new Set([...availability.slots, ...slots])]; // Prevent duplicate slots

//       availability.slots = updatedSlots;
//       await availability.save();
//       console.log(`Updated availability for userId: ${userId}`);
//       return res.status(200).json({ msg: 'Availability updated successfully', availability });
//     }

//     // If no availability exists, create new availability
//     availability = new Availability({
//       userId: mentorId, // Correct field name (userId)
//       slots,
//     });

//     await availability.save();
//     console.log(`Created new availability for userId: ${userId}`);
//     res.status(201).json({ msg: 'Availability created successfully', availability });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // PUT route to update availability for a specific slot
// router.put('/:userId/edit-slot', async (req, res) => {
//   const { userId } = req.params; // Get the userId from the URL parameter
//   const { oldSlot, newSlot } = req.body;

//   console.log(`Received PUT request for userId: ${userId} to update slot from '${oldSlot}' to '${newSlot}'`);

//   // Validate oldSlot and newSlot input
//   if (!oldSlot || !newSlot) {
//     return res.status(400).json({ msg: 'Both oldSlot and newSlot are required' });
//   }

//   try {
//     // Ensure userId is passed correctly and in a valid ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ msg: 'Invalid userId' });
//     }

//     // Find existing availability for the mentor
//     let availability = await Availability.findOne({
//       userId: new mongoose.Types.ObjectId(userId), // Use userId instead of mentor
//     });

//     if (!availability) {
//       return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
//     }

//     // Find the index of the old slot and update it
//     const slotIndex = availability.slots.indexOf(oldSlot);
//     if (slotIndex === -1) {
//       return res.status(404).json({ msg: 'Old slot not found' });
//     }

//     // Replace the old slot with the new one
//     availability.slots[slotIndex] = newSlot;

//     // Save the updated availability
//     await availability.save();
//     console.log(`Updated availability for userId: ${userId}`);
//     res.status(200).json({ msg: 'Slot updated successfully', availability });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // GET route to retrieve availability for a specific mentor
// router.get('/:userId', async (req, res) => {
//   const { userId } = req.params; // Get the userId from the URL parameter

//   console.log(`Received GET request for userId: ${userId}`);

//   try {
//     // Find the availability using ObjectId for matching mentor
//     const availability = await Availability.findOne({
//       userId: new mongoose.Types.ObjectId(userId), // Use userId instead of mentor
//     });

//     if (!availability) {
//       return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
//     }

//     console.log(`Returning availability for userId: ${userId}`);
//     res.json(availability);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// // DELETE route to remove a slot for a specific mentor
// router.delete('/:userId/delete-slot', async (req, res) => {
//   const { userId } = req.params; // Get the userId from the URL parameter
//   const { slot } = req.body; // Get the slot to delete from the request body

//   console.log(`Received DELETE request for userId: ${userId} to remove slot: '${slot}'`);

//   // Validate slot input
//   if (!slot) {
//     return res.status(400).json({ msg: 'Slot is required' });
//   }

//   try {
//     // Ensure userId is passed correctly and in a valid ObjectId format
//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res.status(400).json({ msg: 'Invalid userId' });
//     }

//     // Find existing availability for the mentor
//     let availability = await Availability.findOne({
//       userId: new mongoose.Types.ObjectId(userId), // Use userId instead of mentor
//     });

//     if (!availability) {
//       return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
//     }

//     // Remove the specified slot
//     const slotIndex = availability.slots.indexOf(slot);
//     if (slotIndex === -1) {
//       return res.status(404).json({ msg: 'Slot not found' });
//     }

//     // Remove the slot from the array
//     availability.slots.splice(slotIndex, 1);

//     // Save the updated availability
//     await availability.save();
//     console.log(`Deleted slot '${slot}' for userId: ${userId}`);
//     res.status(200).json({ msg: 'Slot deleted successfully', availability });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server error');
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Availability = require('../models/availability'); // Import the Availability model
const MentorProfile = require('../models/mentorProfile'); // Import the MentorProfile model
const User = require('../models/users'); // Import the User model

// Helper function to check if a slot is already taken
const isSlotTaken = async (userId, slot) => {
  // Check if the slot is already taken by querying the Availability model
  const availability = await Availability.findOne({ userId: new mongoose.Types.ObjectId(userId) });
  if (availability && availability.slots.includes(slot)) {
    return true; // Slot is already taken
  }
  return false; // Slot is available
};

// Helper function to validate the time range format (example: "9:00 PM - 10:00 PM")
const isValidTimeSlot = (slot) => {
  // Regex to match time range format: "9:00 PM - 10:00 PM"
  const timeSlotRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] ([APap][Mm]|[APap]\.M|[APap]\.M\.)\s*-\s*(0?[1-9]|1[0-2]):[0-5][0-9] ([APap][Mm]|[APap]\.M|[APap]\.M\.)$/;
  return timeSlotRegex.test(slot);
};

// POST route to create or add availability for a mentor
router.post('/:userId', async (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter
  const { slots } = req.body;

  console.log(`Received POST request for userId: ${userId} with slots: ${slots}`);

  // Validate slots input
  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ msg: 'Please provide an array of time slots with at least one slot.' });
  }

  // Validate that each slot is in the correct time range format
  for (let slot of slots) {
    if (!isValidTimeSlot(slot)) {
      return res.status(400).json({ msg: `Invalid time slot format: ${slot}. Please provide a valid time range like "9:00 PM - 10:00 PM".` });
    }
  }

  try {
    // Ensure userId is passed correctly and in a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid userId' });
    }

    // Ensure the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Resolve userId to the mentor's ObjectId
    const mentorProfile = await MentorProfile.findOne({
      $or: [{ _id: userId }, { user: userId }],
    });

    if (!mentorProfile) {
      return res.status(404).json({ msg: 'Mentor profile not found' });
    }

    const mentorId = mentorProfile.user;

    // Check if any of the new slots are already taken
    for (let slot of slots) {
      const isTaken = await isSlotTaken(mentorId, slot);
      if (isTaken) {
        return res.status(400).json({ msg: `Slot '${slot}' is already taken.` });
      }
    }

    // Find existing availability for the mentor
    let availability = await Availability.findOne({
      userId: new mongoose.Types.ObjectId(mentorId),
    });

    // If availability exists, add the new slots to the existing slots
    if (availability) {
      const updatedSlots = [...new Set([...availability.slots, ...slots])]; // Prevent duplicate slots

      availability.slots = updatedSlots;
      await availability.save();
      console.log(`Updated availability for userId: ${userId}`);
      return res.status(200).json({ msg: 'Availability updated successfully', availability });
    }

    // If no availability exists, create new availability
    availability = new Availability({
      userId: mentorId,
      slots,
    });

    await availability.save();
    return res.status(201).json({ msg: 'Availability created successfully', availability });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// PUT route to update availability for a specific slot
router.put('/:userId/edit-slot', async (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter
  const { oldSlot, newSlot } = req.body;

  console.log(`Received PUT request for userId: ${userId} to update slot from '${oldSlot}' to '${newSlot}'`);

  // Validate oldSlot and newSlot input
  if (!oldSlot || !newSlot) {
    return res.status(400).json({ msg: 'Both oldSlot and newSlot are required' });
  }

  // Validate the new slot format
  if (!isValidTimeSlot(newSlot)) {
    return res.status(400).json({ msg: `Invalid time slot format: ${newSlot}. Please provide a valid time range like "9:00 PM - 10:00 PM".` });
  }

  try {
    // Ensure userId is passed correctly and in a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid userId' });
    }

    // Find existing availability for the mentor
    let availability = await Availability.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!availability) {
      return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
    }

    // Find the index of the old slot and update it
    const slotIndex = availability.slots.indexOf(oldSlot);
    if (slotIndex === -1) {
      return res.status(404).json({ msg: 'Old slot not found' });
    }

    // Replace the old slot with the new one
    availability.slots[slotIndex] = newSlot;

    // Save the updated availability
    await availability.save();
    console.log(`Updated availability for userId: ${userId}`);
    res.status(200).json({ msg: 'Slot updated successfully', availability });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET route to retrieve availability for a specific mentor
router.get('/:userId', async (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter

  console.log(`Received GET request for userId: ${userId}`);

  try {
    // Find the availability using ObjectId for matching mentor
    const availability = await Availability.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!availability) {
      return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
    }

    console.log(`Returning availability for userId: ${userId}`);
    res.json(availability);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE route to remove a slot for a specific mentor
router.delete('/:userId/delete-slot', async (req, res) => {
  const { userId } = req.params; // Get the userId from the URL parameter
  const { slot } = req.body; // Get the slot to delete from the request body

  console.log(`Received DELETE request for userId: ${userId} to remove slot: '${slot}'`);

  // Validate slot input
  if (!slot) {
    return res.status(400).json({ msg: 'Slot is required' });
  }

  try {
    // Ensure userId is passed correctly and in a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ msg: 'Invalid userId' });
    }

    // Find existing availability for the mentor
    let availability = await Availability.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!availability) {
      return res.status(404).json({ msg: 'Availability not found for this mentor/user' });
    }

    // Remove the specified slot
    const slotIndex = availability.slots.indexOf(slot);
    if (slotIndex === -1) {
      return res.status(404).json({ msg: 'Slot not found' });
    }

    // Remove the slot from the array
    availability.slots.splice(slotIndex, 1);

    // Save the updated availability
    await availability.save();
    console.log(`Deleted slot '${slot}' for userId: ${userId}`);
    res.status(200).json({ msg: 'Slot deleted successfully', availability });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;