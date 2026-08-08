const pool = require("../config/db");
const bcrypt = require("bcrypt");


// ================= GET PROFILE =================

const getProfile = async (req, res) => {

  try {

    const { id } = req.params;


    const result = await pool.query(
      `
      SELECT
        id,
        fullname,
        email,
        role,
        created_at
      FROM users
      WHERE id = $1
      `,
      [id]
    );


    if (result.rows.length === 0) {

      return res.status(404).json({
        success:false,
        message:"User not found."
      });

    }


    res.status(200).json({

      success:true,
      user:result.rows[0]

    });


  } catch(error){

    console.error("GET PROFILE ERROR:", error);


    res.status(500).json({

      success:false,
      message:"Server Error"

    });

  }

};




// ================= UPDATE PROFILE =================

const updateProfile = async (req,res)=>{

  try{

    const {id}=req.params;

    const {fullname}=req.body;



    if(!fullname || fullname.trim().length < 3){

      return res.status(400).json({

        success:false,
        message:"Full name must contain at least 3 characters."

      });

    }



    const currentUser = await pool.query(

      "SELECT fullname FROM users WHERE id=$1",

      [id]

    );



    if(currentUser.rows.length===0){

      return res.status(404).json({

        success:false,
        message:"User not found."

      });

    }



    if(
      currentUser.rows[0].fullname.trim().toLowerCase()
      ===
      fullname.trim().toLowerCase()
    ){

      return res.status(400).json({

        success:false,
        message:"Please enter a different name."

      });

    }



    const result = await pool.query(

      `
      UPDATE users
      SET fullname=$1
      WHERE id=$2
      RETURNING
      id,
      fullname,
      email,
      role,
      created_at
      `,

      [
        fullname.trim(),
        id
      ]

    );



    res.status(200).json({

      success:true,
      message:"Profile updated successfully.",
      user:result.rows[0]

    });



  }catch(error){

    console.error("UPDATE PROFILE ERROR:",error);


    res.status(500).json({

      success:false,
      message:"Server Error"

    });

  }

};





// ================= CHANGE PASSWORD =================


const changePassword = async(req,res)=>{


  try{


    const {id}=req.params;


    const {
      currentPassword,
      newPassword
    } = req.body;



    console.log("USER ID:",id);

    console.log(
      "CURRENT PASSWORD:",
      currentPassword
    );

    console.log(
      "NEW PASSWORD:",
      newPassword
    );




    if(!currentPassword || !newPassword){


      return res.status(400).json({

        success:false,
        message:"All password fields are required."

      });


    }




    // Password rule 6-8 characters

    const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,8}$/;




    if(!passwordRegex.test(newPassword)){


      return res.status(400).json({

        success:false,

        message:
        "Password must be 6-8 characters and contain uppercase, lowercase, number and special character."

      });


    }




    if(currentPassword===newPassword){


      return res.status(400).json({

        success:false,

        message:
        "New password cannot be same as current password."

      });


    }




    // Get user password

    const result = await pool.query(

      "SELECT password FROM users WHERE id=$1",

      [id]

    );




    if(result.rows.length===0){


      return res.status(404).json({

        success:false,

        message:"User not found."

      });


    }




    const user=result.rows[0];



    console.log(
      "DATABASE PASSWORD:",
      user.password
    );





    // Check old password


    const match = await bcrypt.compare(

      currentPassword,

      user.password

    );




    if(!match){


      return res.status(400).json({

        success:false,

        message:"Current password is incorrect."

      });


    }





    // Hash new password


    const hashedPassword =
    await bcrypt.hash(
      newPassword,
      10
    );





    await pool.query(

      `
      UPDATE users
      SET password=$1
      WHERE id=$2
      `,

      [
        hashedPassword,
        id
      ]

    );





    res.status(200).json({

      success:true,

      message:"Password changed successfully."

    });




  }catch(error){


    console.error(
      "CHANGE PASSWORD ERROR:",
      error
    );



    res.status(500).json({

      success:false,

      message:error.message

    });


  }


};





module.exports={

  getProfile,

  updateProfile,

  changePassword

};