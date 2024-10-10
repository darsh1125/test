// comparison operator
// $expr
// $lt $gt
// $exists
// $expr - aggreation comparison arthimatic s
// $expr:{
//     $gt:['field1','field2']
// }
// $regx
// updatemany {experience:{ duration : { $lte:1 }}},{ $set:{ "experience.$[].neglet":{ good:true } } }
// updatemany {experience:{ duration : { $lte:1 }}},{ $set:{ "experience.$.neglet":{ good:true } } }
// { $push:{ experience:{ name:"" }  } }
// { $addToSet:{ experience:{ company :{ name:'dssfdsf' } } } }
// $pop:{ experinxe:1 -1  }

// aggegation  pipeline operation - sequence of operater
// db.users.aggregate([{ $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }])

// db.users.aggregate([{ $match:{} },{ $group:{ _id:"null",customers:{ $push:{id:"$_id"} } } },{ $project:{ customers:1,count:{ $size:'$customers' } } }])


// db.users.aggregate([{ $group:{ _id:null,count:{ $sum:{ $size:  { $ifNull:["$Hobbies",[]] } } } } }])
