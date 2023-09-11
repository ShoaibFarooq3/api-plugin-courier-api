
export default async function addLabelToOrder(context, args) {
  const {
    referenceId,
    label
   
  } = args;
  const { collections } = context;
  const { Orders } = collections;
 console.log("referenceId",referenceId)
 console.log("label",label)
 let orderUpdate = await Orders.findOneAndUpdate(
  { "referenceId":referenceId },
  {
    $set: {
      "shipmentLabel": label,
    },
  }
); 
console.log(orderUpdate)
return null;
}