import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/nguoidung`;


// =====================
// SAFE FETCH
// =====================
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {})
      }
    });

    const text = await res.text();

    let data;

    try{
      data = JSON.parse(text);
    }
    catch{
      throw new Error(text);
    }

    if(!res.ok){
      throw new Error(data?.Message || data || "Request lỗi");
    }

    return data;

  } catch(err){
    throw err;
  }
};



// =====================
// 1. GET USERS
// =====================
export const getNguoiDung = async (
 userId,
 search="",
 nhomId=null,
 page=1
)=>{

 let url=
`${BASE_URL}?userId=${userId}&page=${page}`;

 if(search)
   url+=`&search=${encodeURIComponent(search)}`;

 if(nhomId)
   url+=`&nhomId=${nhomId}`;

 return safeFetch(url,{
   method:"GET"
 });

};




// =====================
// 2. CREATE  ✅ FIX CHUẨN
// =====================
export const createNguoiDung = async (
 payload,
 MaNhom
)=>{

 return safeFetch(
`${BASE_URL}/create?MaNhom=${MaNhom}`,
{
 method:"POST",
 body:JSON.stringify(payload)
});

};




// =====================
// 3. DETAIL
// =====================
export const getNguoiDungDetail=async(id)=>{

return safeFetch(
`${BASE_URL}/${id}`,
{
method:"GET"
});

};




// =====================
// 4. EDIT
// =====================
export const editNguoiDung=async(
payload,
MaNhom
)=>{

return safeFetch(
`${BASE_URL}/edit?MaNhom=${MaNhom}`,
{
method:"POST",
body:JSON.stringify(payload)
});

};




// =====================
// 5. DELETE
// =====================
export const deleteNguoiDung=async(
id,
maNhom
)=>{

return safeFetch(
`${BASE_URL}/delete?id=${id}&maNhom=${maNhom}`,
{
method:"POST"
});

};