const { ValidatePendingApprovals } = require("../controllers/v1.controllers/RequestController");
const orderRepository=require("../repositories/order.repository");
const exportToExcelAndUpload = require("../Uploadexceltodrive");

exports.getAllOrders=async(user)=>{
    query={}
   let queryWithApprovals
    if (req.user.userId==='6830789898ef43e5803ea02c'){
      queryWithApprovals = {
      ...query,
      $or:[
        {"staff":req.user.userId},
        {"status":"Completed"},
        {
          PendingApprovals: { 
            $not: { $elemMatch: { Level: {$in:[1,2]} } }
          }
        }
        
      ]
    };
    }if(req.user.role==='Accountant' || req.user.role==="Financial_manager"){
       queryWithApprovals = { 
        ...query,
        $expr: {
        $gte: [
          {
            $size: {
              $filter: {
                input: "$Approvals",
                as: "admin",
                cond: { $eq: ["$$admin.status", "Approved"] }
              }
            }
          },
          2
        ]
      }};

    }
    else{

      queryWithApprovals = {
        ...query,
        $or:[
          {"staff":req.user.userId},
          {"status":{$in:["Completed","Approved"]}},
          {
            PendingApprovals: { 
              $not: { $elemMatch: { Level: 1 } }
            }
          }
          
        ]
      };
    }

    return await orderRepository.getPaginatedOrders(queryWithApprovals)
}


exports.getDepartmentalOrders=async(user,Department)=>{
  try{
    let total;
    let paginatedOrders;
    let query={
      $or:[
        {"staff":req.user.userId},
        {"status":{$in:["Completed","Approved"]}},
        {"PendingApprovals.Level": {$in:[1]}}
        
      ]
    }
    const Managers=["Waste Management Manager","Contracts_manager",
    "Financial_manager","Environmental_lab_manager","Facility Manager"]
    const subordinates=["Facility Manager","Waste Management Supervisor","lab_supervisor"]


    const allOrders=await orderRepository.getOrders(query)

    const filteredOrders = allOrders.filter(order => 
     {if (!order.targetDepartment){

        return order.staff?.Department === Department
      }
      return order.targetDepartment===Department}
    );
    if(subordinates.includes(req.user.role)){
      const NewFilteredOrders= filteredOrders.filter(order=>
        !Managers.includes(order.staff.role)
      )

      total=NewFilteredOrders.length
      paginatedOrders=NewFilteredOrders.slice(skip,skip+limit)
    }else{

      
      total = filteredOrders.length;
      paginatedOrders = filteredOrders.slice(skip, skip + limit);
    }


    const response = paginatedOrders.map(order => {
      const plainOrder = order.toObject();
      /*if (!globalRoles.includes(req.user.role)) {
        delete plainOrder.Approvals;
      }*/
      return plainOrder;
    });
    return {response:response,total:total}


  }catch(error){

  }
}
exports.getStaffOrders=async(user)=>{
  const query={}
  query.staff=user.userId
  return await orderRepository.getPaginatedOrders(query)
}

exports.getDepartmentDisplayOrders=async(user)=>{
 const UserDepartment=user.Department
 const repositoryResponse=await orderRepository.getDepartmentDisplayORders()
 const filteredOrders = repositoryResponse.data.filter(order => 
     {if (!order.targetDepartment){

        return order.staff?.Department === UserDepartment
      }
      return order.targetDepartment===UserDepartment}
    );
  return {data:filteredOrders}

  }

exports.getStaffDisplayOrders=async(user)=>{
    
    const response=await orderRepository.getStaffDisplayOrders(user)
    const filteredOrders=response.data.map((order)=>{
      const plainOrder=order.toObject();
      return plainOrder
    })

    return {data:filteredOrders,total:response.total}
}

exports.createOrder=async(payload,user,res)=>{
   const {email}=user

   const User=await user.findOne({email})
   if (!User) {
         return res.status(404).json({ error: "User not found" });
   }   
   const repositoryResponse=await orderRepository.createOrder(payload)
   ValidatePendingApprovals(repositoryResponse.data._id)
   await exportToExcelAndUpload(repositoryResponse.data._id)
   return {data:repositoryResponse.data}
}

