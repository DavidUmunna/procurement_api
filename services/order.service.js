const { ValidatePendingApprovals } = require("../controllers/v1.controllers/RequestController");
const orderRepository=require("../repositories/order.repository");
const exportToExcelAndUpload = require("../Uploadexceltodrive");
const ExcelJS=require("exceljs")
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


exports.exportOrder=async(payload,res)=>{
  const query={
    createdAt:{
      $gte:payload.start,
      $lte:payload.end
    }
  }
  if (payload.status && payload.status!=="All"){
    query.status=payload.status
  }
  if (payload.filename && typeof payload.filename==="string"){

      const sanitizedFileName = filename.replace(/[^a-zA-Z0-9-_]/g, '_');
      const timestamp = Date.now();
      
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${sanitizedFileName}-${timestamp}.xlsx`);
    }
  const repositoryResponse=await orderRepository.exportOrder(query)
  const requestItems=repositoryResponse.data
    const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Purchase Requests');
      
      // Define headers
      worksheet.columns = [
        { header: "Request Title", key: "title", width: 20 },
        { header: "Ordered By", key: "orderedBy", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Product Name", key: "productName", width: 20 },
        { header: "Product Quantity", key: "productQuantity", width: 20 },
        { header: "Product Price", key: "productPrice", width: 20 },
        { header: "Remarks", key: "remarks", width: 25 },
        { header: "Urgency", key: "urgency", width: 20 },
        { header: "Status", key: "status", width: 20 },
        { header: "Department", key: "department", width: 20 },
        { header: "Date Created", key: "createdAt", width: 20 },
      ];
  
      // Add rows for each product in each request
      requestItems.forEach((item) => {
        
        if (item.products && item.products.length > 0) {
          item.products.forEach((product) => {
            
            worksheet.addRow({
              title: item.Title,
              orderedBy: item.staff?.name || '',
              email: item.staff?.email || '',
              productName: product.name || '',
              productQuantity: product.quantity || 0,
              productPrice: product.price || 0,
              remarks:item.remarks || '',
              urgency: item.urgency,
              status: item.status,
              department: item.staff?.Department || '',
              createdAt:item.createdAt instanceof Date
              ? item.createdAt.toISOString().slice(0, 10)
              : (item.createdAt?.slice(0, 10) || '')
            });
           
          });
        } else {
          // Add row even if no products (with empty product fields)
          worksheet.addRow({
            title: item.Title,
            orderedBy: item.staff?.name || '',
            email: item.staff?.email || '',
            productName: '',
            productQuantity: '',
            productPrice: '',
            remarks:item.remarks||'',
            urgency: item.urgency,
            status: item.status,
            department: item.staff?.Department || '',
            createdAt:item.createdAt instanceof Date
              ? item.createdAt.toISOString().slice(0, 10)
              : (item.createdAt?.slice(0, 10) || '')
          });
        }
      });
  await workbook.xlsx.write(res)
  res.end();
}

