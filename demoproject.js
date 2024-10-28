const formData = {
    billboardCompany: "60f5e2bb21d1b2aefeb7a234", // ID of selected Billboard Company
    billboards: [
      {
        billboardid: "60f5e2bb21d1b2aefeb7a111",
        billboardname: "deme1",
        slots: [
          { slotname: "demo slot2", starttime: "", endtime: "", price: 500 },
        ],
      }, // Billboard 1
      {
        billboardid: "60f5e2bb21d1b2aefeb7a222",
        billboardname: "demo2",
        slots: [
          { slotname: "demo slot2", starttime: "", endtime: "", price: 500 },
        ],
      }, // Billboard 2
    ],
    uniqueSlot: "prime-time-slot",
    adAgency: "60f5e2bb21d1b2aefeb7a456", // ID of the Ad Agency
    adFiles: [
      { url: "/uploads/ad1.png", name: "ad1", extension: "png" },
      { url: "/uploads/ad2.png", name: "ad2", extension: "png" },
      { url: "/uploads/ad3.png", name: "ad3", extension: "png" },
      { url: "/uploads/ad4.png", name: "ad4", extension: "png" },
      { url: "/uploads/ad5.png", name: "ad5", extension: "png" },
    ],
  };
  
  router.get("/adbooking", async (req, res) => {
    const { billboardCompany, billboards, uniqueSlot, adAgency, adFiles } =
      formData;
    // Create an array to store all the records we want to insert
    const adBookingRecords = [];
    // Loop through each selected billboard
    for (const billboard of billboards) {
      // Loop through each uploaded ad file
      for (const adFile of adFiles) {
        // Create a new ad booking record
        const newAdBooking = {
          billboardCompany: billboardCompany,
          billboard: {
            billboardid: billboard.billboardid,
            billboardname: billboard.billboardname,
            slots: billboard.slots,
          },
          uniqueSlot: uniqueSlot,
          adAgency: adAgency,
          adFile: {
            url: adFile.url,
            name: adFile.name,
            extension: adFile.extension,
          },
        };
        adBookingRecords.push(newAdBooking);
      }
    }
    // Insert all records into the database at once
    try {
      await AdBooking.updateOne(
        { _id: "671dc5a024e4c4364e8b509b" },
        {
          uniqueSlot: "unique time-slot",
          billboard: {
            billboardid: "60f5e2bb21d1b2aefeb7a111",
            billboardname: "demo123",
            slots: [
              { slotname: "demo slot1", starttime: "", endtime: "", price: 1000 },
              { slotname: "demo slot2", starttime: "", endtime: "", price: 500 }, 
              { slotname: "demo slot2", starttime: "", endtime: "", price: 500 },
              { slotname: "demo slot2", starttime: "", endtime: "", price: 500 },
  
            ],
          },
        }
      );
      // await AdBooking.insertMany(adBookingRecords);
      console.log(
        `${adBookingRecords.length} ad bookings have been created successfully.`
      );
  
      res.status(200).json("Data Inserted Succeesffuly !!!!!!!");
    } catch (error) {
      console.error("Error creating ad bookings:", error);
      throw error;
    }
  });