const orderservice=require("../../services/order.service")
const {getPagination,getPagingData}=require("../../Global_Functions/pagination")

exports.getAllOrders=async(req,res)=>{
    try{
        const { page, limit, skip } = getPagination(req);

        const orders=await orderservice.getAllOrders(req.user)
        return res.status(200).json({data:orders.orders,Pagination:getPagingData(orders.total,page,limit)})

    }catch(error){
        return res.status(500).json({message:"Server Error"})
    }
}

exports.getDepartmentOrders=async(req,res)=>{
    try{
        const { Department } = req.query;
        const { page, limit, skip } = getPagination(req);

        const serviceResponse=await orderservice.getDepartmentalOrders(req.user,Department)

        return res.status(200).json({data:serviceResponse.response,Pagination:getPagination(serviceResponse.total,page,limit)})

    }catch(error){
        return res.status(500).json({message:"Server Error"})
    }
}


exports.getStaffOrders=async(req,res)=>{
    try{
        const { id } = req.params;
        const { page, limit } = getPagination(req);
        if (!id) {
        return res.status(400).json({ error: "Email is required" });
        }

        const serviceResponse=await orderservice.getStaffOrders(req.user)
        return res.status(200).json({data:serviceResponse.orders,
            Pagination: getPagingData(serviceResponse.total, page, limit)
        })


    }catch(error){
        return res.status(500).json({message:"Server Error"})

    }
}

exports.getAllOrdersForDepartment=async(req,res)=>{
    try{
        const serviceResponse=await orderservice.getDisplayOrders(req.user)

        return res.status(200).status({data:serviceResponse.data})

    }catch(error){
        console.error("Error fetching department orders:", error);
         return res.status(500).json({message:"Server Error"})
    }
}