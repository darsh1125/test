
const existingobj = {
    _id:"",
    name:"",
    itemDetails:[
        {
           productcategory:"Product1",
           productqty:2
        },
        {
          productcategory:"Product2",
           productqty:1
        }
    ]
}


const inputobj = {
    _id:"",
    name:"",
    itemDetails:[
        {
           productcategory:"Product1",
           productqty:4
        },
        {
          productcategory:"Product2",
           productqty:2
        },
        {
            productcategory:"Product3",
             productqty:2
          }
    ]
}




function getExtraQuantities(existingObj, inputObj) {
    const extraQuantities = [];

    // Convert existingObj's itemDetails to a map for faster lookup
    const existingMap = new Map();
    existingObj.itemDetails.forEach(item => {
        existingMap.set(item.productcategory, item.productqty);
    });

    // Compare inputObj's itemDetails with existingObj's
    inputObj.itemDetails.forEach(inputItem => {
        const existingQty = existingMap.get(inputItem.productcategory) || 0; // Default to 0 if not found
        const extraQty = inputItem.productqty - existingQty;

        if (extraQty > 0) {
            extraQuantities.push({
                productcategory: inputItem.productcategory,
                extraqty: extraQty
            });
        }
    });

    return extraQuantities;
}

// Example usage:
const existingobj = {
    _id: "",
    name: "",
    itemDetails: [
        { productcategory: "Product1", productqty: 2 },
        { productcategory: "Product2", productqty: 1 }
    ]
};

const inputobj = {
    _id: "",
    name: "",
    itemDetails: [
        { productcategory: "Product1", productqty: 4 },
        { productcategory: "Product2", productqty: 2 },
        { productcategory: "Product3", productqty: 2 }
    ]
};

console.log(getExtraQuantities(existingobj, inputobj));
// Output: 
// [
//   { productcategory: "Product1", extraqty: 2 },
//   { productcategory: "Product2", extraqty: 1 },
//   { productcategory: "Product3", extraqty: 2 }
// ]



const existingobj = {
    _id: "",
    name: "",
    itemDetails: [
        { productcategory: "Product1", productqty: 2 },
        { productcategory: "Product2", productqty: 2 }
    ]
};

const inputobj = {
    _id: "",
    name: "",
    itemDetails: [
        { productcategory: "Product1", productqty: 4 },
        { productcategory: "Product2", productqty: 2 },
        { productcategory: "Product3", productqty: 2 }
    ]
};
    function getExtraQuantities(existingObj, inputObj) {
      const extraQuantities = [];
  
      // Compare inputObj's itemDetails with existingObj's
      inputObj.itemDetails.forEach(inputItem => {
          // Find the corresponding item in existingObj.itemDetails
          const existingItem = existingObj.itemDetails.find(
              item => item.productcategory === inputItem.productcategory
          );
  
          // Get the existing quantity or default to 0 if not found
          const existingQty = existingItem ? existingItem.productqty : 0;
          const extraQty = inputItem.productqty - existingQty;
  
          if (extraQty > 0) {
              extraQuantities.push({
                  productcategory: inputItem.productcategory,
                  extraqty: extraQty
              });
          }
      });
  
      return extraQuantities;
  }
  
 
  
  console.log(getExtraQuantities(existingobj, inputobj));
