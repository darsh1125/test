router.get("/getdataapi",async(req,res) => {
    try {
  
  
      function calculateUnitsWithDimensions(existingObj, inputObj) {
        let totalPossibleUnits = Infinity; // Start with the highest possible units
        let remainingQuantities = {}; // To store remaining proqty for each product
        let remainingDimensions = {}; // To store remaining gsm, width, and height for each product
      
        // First pass: Determine the total possible units
        for (const existingItem of existingObj.itemsdetails) {
          const { productcategory, proqty, gsm, width, height } = existingItem;
          const requiredQty = parseInt(proqty);
      
          // Find the corresponding item in inputObj
          const inputItem = inputObj.itemsdetails.find(item => item.productcategory === productcategory);
      
          if (!inputItem) continue; // Skip if no matching item found
      
          const inputQty = parseInt(inputItem.proqty || 0); // Default to 0 if missing
          const inputGsm = parseInt(inputItem.gsm || 0);
          const inputWidth = parseInt(inputItem.width || 0);
          const inputHeight = parseInt(inputItem.height || 0);
      
          // Calculate possible units based on each constraint
          const possibleUnitsByQty = Math.floor(inputQty / requiredQty);
          const possibleUnitsByGsm = gsm ? Math.floor(inputGsm / gsm) : Infinity;
          const possibleUnitsByWidth = width ? Math.floor(inputWidth / width) : Infinity;
          const possibleUnitsByHeight = height ? Math.floor(inputHeight / height) : Infinity;
  
          console.log("possibleUnitsByQty  ",possibleUnitsByQty," possibleUnitsByGsm",possibleUnitsByGsm,"possibleUnitsByWidth ",possibleUnitsByWidth,"possibleUnitsByHeight",
            possibleUnitsByHeight
          );
          
      
          // Determine the bottleneck for this product
          const possibleUnits = Math.min(possibleUnitsByQty, possibleUnitsByGsm, possibleUnitsByWidth, possibleUnitsByHeight);
  
          console.log("possible units ",possibleUnits);
          // Update the global bottleneck (totalPossibleUnits)
          totalPossibleUnits = Math.min(totalPossibleUnits, possibleUnits);
        }
      
        // Second pass: Calculate remaining quantities and dimensions
        for (const existingItem of existingObj.itemsdetails) {
          const { productcategory, proqty, gsm, width, height } = existingItem;
          const requiredQty = parseInt(proqty);
      
          // Find the corresponding item in inputObj
          const inputItem = inputObj.itemsdetails.find(item => item.productcategory === productcategory);
      
          if (!inputItem) continue; 
          const inputQty = parseInt(inputItem.proqty || 0);
          const inputGsm = parseInt(inputItem.gsm || 0);
          const inputWidth = parseInt(inputItem.width || 0);
          const inputHeight = parseInt(inputItem.height || 0);
      
          // Calculate remaining quantities and dimensions
          remainingQuantities[productcategory] = Math.max(inputQty - (totalPossibleUnits * requiredQty), 0);
          remainingDimensions[productcategory] = {
            gsm: gsm ? Math.max(inputGsm - (gsm * totalPossibleUnits), 0) : 0,
            width: width ? Math.max(inputWidth - (width * totalPossibleUnits), 0) : 0,
            height: height ? Math.max(inputHeight - (height * totalPossibleUnits), 0) : 0,
          };
        }
      
        return {
          totalPossibleUnits,
          remainingQuantities,
          remainingDimensions,
        };
      }
      
      // Example Usage
      const existingObj = {
        _id: "475896857496",
        objname: "obj",
        itemsdetails: [
          {
            _id: "fsdssf89464646564464",
            productcategory: "product1",
            proqty: "3",
            gsm: 50,
            width: 12,
            height: 6,
          },
          {
            _id: "fsdssf89464646564464",
            productcategory: "product2",
            proqty: "2",
            gsm: 50,
            width: 10,
            height: 5,
          },
        ],
      };
      
      const inputObj = {
        _id: "475896857496",
        objname: "obj",
        itemsdetails: [
          {
            _id: "fsdssf89464646564464",
            productcategory: "product1",
            proqty: "5",
            gsm: 50,
            width:50,
            height:6,
          },
          {
            _id: "fsdssf89464646564464",
            productcategory: "product2",
            proqty: "2",
            gsm: 50,
            width: 22,
            height: 15,
          },
        ],
      };
  
      // 12-6 10-5 - 2  
      // 24-6 22-5 - 2  12 - 12 
      
      const result = calculateUnitsWithDimensions(existingObj, inputObj);
      console.log(result);
      
      
      res.status(200).json("");
  
    } catch (error) {
      res.status(500).json(error.message);
      
    }
  })