const mongoose=require("mongoose")

const CompanyDataSchema=mongoose.Schema({
    CompanyName:{
        type:String,
        Required:true
    },
    OrganizationStructure:{
        type:String,
        enum:["Hierarchical Structure","Flat Structure", "Matrix Structure","Divisional Structure"
            ,"Team-based Structure","Network Structure","Process-based"
        ]
    },
    ResourcesToStreamline:[{
        ResourceName:{
            type:String
        }

    }], WorkFlow:{
        type:String,
        Required:true
    },
},{Timestamp:true}
);

const CompanyData=mongoose.model("CompanyData",CompanyDataSchema)

module.exports=CompanyData