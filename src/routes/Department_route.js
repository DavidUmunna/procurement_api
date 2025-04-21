const express = require("express");
const auth = require("./check-auth");
const Department = require('../models/Department');
const router = express.Router();
const User=require("../models/users_")
const { body, validationResult } = require('express-validator');

// Get all departments
router.get('/', auth, async (req, res) => {
    try {
        const departments = await Department.find()
            //.populate('users', 'name email role')
            .populate('headOfDepartment.user' );
        
        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving departments'
        });
    }
});

// Get single department
router.get('/:id', auth, async (req, res) => {
    try {
        const department = await Department.find()
            //.populate('users', 'name email')
            //.populate('headOfDepartment');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving department'
        });
    }
});

// Create department
router.post('/', 
    auth,
    [
      body('name').notEmpty().withMessage('Department name is required'),
      body('headOfDepartment').notEmpty().withMessage('Head of department is required'),
      body('users').optional().isArray().withMessage('Users must be an array')
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            errors: errors.array()
          });
        }
  
        const { name, users = [], headOfDepartment } = req.body;
       
        // Check if department exists
        const existingDept = await Department.findOne({ name });
        if (existingDept) {
          return res.status(400).json({
            success: false,
            message: 'Department already exists'
          });
        }
        const headOfDepartment_id=headOfDepartment.user

        const user_head=await User.findById(headOfDepartment_id)
  
        const department = new Department({
          name,
          users,
          headOfDepartment:{user:user_head._id,name:user_head.name},
          createdBy: req.user.id
        });
        
  
        await department.save();
        
        res.status(201).json({
          success: true,
          data: department
        });
  
      } catch (error) {
        console.error("Error creating department:", error);
        res.status(500).json({
          success: false,
          message: 'Server error creating department',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
  );
// Update department
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, users, headOfDepartment } = req.body;

        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check for duplicate name (excluding current department)
        if (name && name !== department.name) {
            const existingDept = await Department.findOne({ name });
            if (existingDept) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this name already exists'
                });
            }
        }

        department.name = name || department.name;
        department.users = users || department.users;
        department.headOfDepartment = headOfDepartment || department.headOfDepartment;
        department.updatedAt = Date.now();

        await department.save();

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error("Error updating department:", error);
        res.status(500).json({
            success: false,
            message: 'Error updating department'
        });
    }
});

// Delete department
router.delete('/:id', auth, async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        res.status(500).json({
            success: false,
            message: 'Error deleting department'
        });
    }
});

// Add user to department
router.post('/:id/users', auth, async (req, res) => {
    try {
        const { userId, name} = req.body;

        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        console.log("userID",userId)
        if (department.users.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'User already in department'
            });
        }
        const new_user=await User.findById(userId)
        

            console.log("theId exists:",new_user._id)
            new_id=new_user._id
       

        department.users.push({_id:new_user._id,name:new_user.name});
        await department.save();

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error("Error adding user to department:", error);
        res.status(500).json({
            success: false,
            message: 'Error adding user to department'
        });
    }
});

// Remove user from department
router.delete('/:id/users/:userId', auth, async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        console.log(req.params.userId)
        department.users = department.users.filter(
            user => user._id.toString() !== req.params.userId
        );
        console.log(department.users)

        await department.save();

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error("Error removing user from department:", error);
        res.status(500).json({
            success: false,
            message: 'Error removing user from department'
        });
    }
});
// Assign/Update Head of Department
router.patch('/:id/head', 
    auth,
    [
        body('headOfDepartment')
            .notEmpty().withMessage('Head of department ID is required')
            .isMongoId().withMessage('Invalid user ID format')
    ],
    async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { headOfDepartment } = req.body;

            // 1. Verify department exists
            const department = await Department.findById(req.params.id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: 'Department not found'
                });
            }

            // 2. Verify new head exists in users collection
            const user = await User.findById(headOfDepartment);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // 3. Check if user is already head
            if (department.headOfDepartment && department.headOfDepartment.equals(headOfDepartment)) {
                return res.status(400).json({
                    success: false,
                    message: 'User is already head of this department'
                });
            }

            // 4. Verify user belongs to department (optional)
            if (!department.users.includes(headOfDepartment)) {
                return res.status(400).json({
                    success: false,
                    message: 'User must be a department member first'
                });
            }

            // 5. Update head
            department.headOfDepartment = headOfDepartment;
            department.updatedAt = Date.now();
            await department.save();

            // 6. Populate the response
            const populatedDept = await Department.findById(department._id)
                .populate('headOfDepartment', 'name email role');

            res.status(200).json({
                success: true,
                message: 'Head of department updated successfully',
                data: populatedDept
            });

        } catch (error) {
            console.error("Error assigning head:", error);
            res.status(500).json({
                success: false,
                message: 'Error assigning head of department'
            });
        }
    }
);
// Statistics endpoint
router.get('/stats', auth, async (req, res) => {
    try {
      const stats = await Department.aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'department',
            as: 'tasks'
          }
        },
        {
          $project: {
            name: 1,
            memberCount: { $size: '$users' },
            activeTasks: { 
              $size: { 
                $filter: {
                  input: '$tasks',
                  as: 'task',
                  cond: { $ne: ['$$task.status', 'completed'] }
                }
              } 
            },
            taskCompletion: {
              $cond: [
                { $gt: [{ $size: '$tasks' }, 0] },
                {
                  $multiply: [
                    {
                      $divide: [
                        { $size: { 
                          $filter: {
                            input: '$tasks',
                            as: 'task',
                            cond: { $eq: ['$$task.status', 'completed'] }
                          }
                        } },
                        { $size: '$tasks' }
                      ]
                    },
                    100
                  ]
                },
                0
              ]
            }
          }
        }
      ]);
      
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Error fetching stats' });
    }
  });
  

  

module.exports = router;