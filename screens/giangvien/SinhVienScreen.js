import React, { useEffect, useState, useContext } from "react";
import {
View,
Text,
FlatList,
StyleSheet,
TextInput,
TouchableOpacity,
Modal,
Alert,
ActivityIndicator,
RefreshControl,
ScrollView
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

import {
getNguoiDung,
createNguoiDung,
editNguoiDung,
deleteNguoiDung
} from "../../api/nguoidung";

import { getNhom } from "../../api/nhom";

export default function SinhVienScreen({ navigation }) {
const { user } = useContext(AuthContext);

const [students,setStudents]=useState([]);
const [groups,setGroups]=useState([]);
const [loading,setLoading]=useState(true);
const [refreshing,setRefreshing]=useState(false);

const [search,setSearch]=useState("");
const [page,setPage]=useState(1);
const [totalPages,setTotalPages]=useState(1);

const [modalVisible,setModalVisible]=useState(false);
const [editMode,setEditMode]=useState(false);
const [showDate,setShowDate]=useState(false);

const [form,setForm]=useState({
Email:"",
HoTen:"",
GioiTinh:"Nam",
NgaySinh:"",
TrangThai:true
});

const [selectedNhom,setSelectedNhom]=useState(null);


// ====================
// LOAD DATA
// ====================
const loadData=async()=>{
if(!user?.userId) return;

try{
setLoading(true);

const [svData,nhomData]=await Promise.all([
getNguoiDung(user.userId,search,null,page),
getNhom(user.userId)
]);

setStudents(svData.Data || []);
setTotalPages(svData.TotalPages || 1);
setGroups(nhomData || []);

if(!selectedNhom && nhomData?.length){
setSelectedNhom(nhomData[0].MaNhom);
}

}
catch(err){
Alert.alert("Lỗi",err.message);
}
finally{
setLoading(false);
}
};

useEffect(()=>{
loadData();
},[user,page]);


// ====================
// REFRESH
// ====================
const onRefresh=async()=>{
setRefreshing(true);
await loadData();
setRefreshing(false);
};


// ====================
// SEARCH
// ====================
const handleSearch=async(text)=>{
setSearch(text);

try{
const data=await getNguoiDung(user.userId,text,null,1);
setStudents(data.Data || []);
setPage(1);
}catch(err){
Alert.alert("Lỗi",err.message);
}
};


// ====================
// RESET FORM
// ====================
const resetForm=()=>{
setForm({
Email:"",
HoTen:"",
GioiTinh:"Nam",
NgaySinh:"",
TrangThai:true
});
};


// ====================
// OPEN CREATE
// ====================
const openCreate=()=>{
resetForm();
setEditMode(false);
setModalVisible(true);
};


// ====================
// OPEN EDIT
// ====================
const openEdit=(item)=>{
setForm({
Id:item.Id,
Email:item.Email,
HoTen:item.HoTen,
GioiTinh:item.GioiTinh || "Nam",
NgaySinh:item.NgaySinh
? new Date(item.NgaySinh).toISOString().split("T")[0]
:"",
TrangThai:item.TrangThai
});

setEditMode(true);
setModalVisible(true);
};


// ====================
// SAVE
// ====================
const handleSave=async()=>{

if(!form.Email || !selectedNhom){
Alert.alert("Thiếu dữ liệu");
return;
}

try{

if(editMode){

await editNguoiDung(form,selectedNhom);
Alert.alert("Thành công","Đã cập nhật");

}else{

await createNguoiDung(
{
Email:form.Email,
HoTen:form.HoTen,
GioiTinh:form.GioiTinh,
NgaySinh:form.NgaySinh,
TrangThai:form.TrangThai
},
selectedNhom
);

Alert.alert("Thành công","Đã thêm sinh viên vào lớp");
}

setModalVisible(false);
loadData();

}catch(err){
Alert.alert("Lỗi",err.message);
}
};


// ====================
// DELETE
// ====================
const handleDelete=(item)=>{
Alert.alert("Xóa sinh viên","Xóa sinh viên khỏi lớp này?",[
{text:"Hủy"},
{text:"Xóa",style:"destructive",onPress:async()=>{
try{
await deleteNguoiDung(item.Id,selectedNhom || groups[0]?.MaNhom);
loadData();
}catch(err){
Alert.alert("Lỗi",err.message);
}
}}
]);
};


// ====================
// RENDER ITEM
// ====================
const renderItem=({item})=>(
<View style={styles.card}>
<Text style={styles.name}>{item.HoTen}</Text>
<Text>{item.Email}</Text>
<Text>Giới tính: {item.GioiTinh}</Text>
<Text>
Ngày sinh: {item.NgaySinh
? new Date(item.NgaySinh).toISOString().split("T")[0]
:""}
</Text>
<Text>
Trạng thái: {item.TrangThai === true ? "Hoạt động":"Khóa"}
</Text>

<View style={styles.rowBtns}>
<TouchableOpacity style={styles.editBtn} onPress={()=>openEdit(item)}>
<Text style={styles.btnText}>Sửa</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.delBtn} onPress={()=>handleDelete(item)}>
<Text style={styles.btnText}>Xóa</Text>
</TouchableOpacity>
</View>
</View>
);


// ====================
// UI
// ====================
return(
<MainLayout navigation={navigation} title="👨‍🎓 Quản lý sinh viên">
<View style={styles.container}>

<View style={styles.topBar}>
<TextInput
placeholder="Tìm sinh viên..."
value={search}
onChangeText={handleSearch}
style={styles.search}
/>

<TouchableOpacity style={styles.addBtn} onPress={openCreate}>
<Text style={styles.btnText}>+ Thêm</Text>
</TouchableOpacity>
</View>


{loading ? (
<ActivityIndicator size="large"/>
):(
<FlatList
data={students}
keyExtractor={(item)=>item.Id}
renderItem={renderItem}
refreshControl={
<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
}
/>
)}


<View style={styles.pagination}>
<TouchableOpacity onPress={()=> page>1 && setPage(page-1)}>
<Text>◀ Prev</Text>
</TouchableOpacity>

<Text>{page}/{totalPages}</Text>

<TouchableOpacity onPress={()=> page<totalPages && setPage(page+1)}>
<Text>Next ▶</Text>
</TouchableOpacity>
</View>


{/* MODAL */}
<Modal visible={modalVisible} animationType="slide">
<ScrollView contentContainerStyle={styles.modal}>

<Text style={styles.titleModal}>
{editMode ? "Sửa sinh viên":"Thêm sinh viên"}
</Text>

<TextInput
placeholder="Email"
value={form.Email}
editable={!editMode}
onChangeText={(v)=>setForm({...form,Email:v})}
style={styles.input}
/>

<TextInput
placeholder="Họ tên"
value={form.HoTen}
onChangeText={(v)=>setForm({...form,HoTen:v})}
style={styles.input}
/>

{/* GENDER */}
<Text style={styles.label}>Giới tính:</Text>
<View style={styles.genderRow}>
<TouchableOpacity onPress={()=>setForm({...form,GioiTinh:"Nam"})}>
<Text>{form.GioiTinh==="Nam"?"🔘":"⚪"} Nam</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setForm({...form,GioiTinh:"Nữ"})}>
<Text>{form.GioiTinh==="Nữ"?"🔘":"⚪"} Nữ</Text>
</TouchableOpacity>
</View>


{/* DATE */}
<Text style={styles.label}>Ngày sinh:</Text>
<TouchableOpacity style={styles.input} onPress={()=>setShowDate(true)}>
<Text>{form.NgaySinh || "Chọn ngày"}</Text>
</TouchableOpacity>

{showDate && (
<DateTimePicker
value={
form.NgaySinh && !isNaN(new Date(form.NgaySinh))
? new Date(form.NgaySinh)
: new Date()
}
mode="date"
onChange={(e,date)=>{
setShowDate(false);
if(date){
const d=date.toISOString().split("T")[0];
setForm({...form,NgaySinh:d});
}
}}
/>
)}


{/* STATUS */}
<Text style={styles.label}>Trạng thái:</Text>
<View style={styles.genderRow}>
<TouchableOpacity onPress={()=>setForm({...form,TrangThai:true})}>
<Text>{form.TrangThai?"🔘":"⚪"} Hoạt động</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setForm({...form,TrangThai:false})}>
<Text>{!form.TrangThai?"🔘":"⚪"} Khóa</Text>
</TouchableOpacity>
</View>


{/* CLASS */}
<Text style={styles.label}>Chọn lớp:</Text>
{groups.map(g=>(
<TouchableOpacity
key={g.MaNhom}
style={[styles.groupItem,selectedNhom===g.MaNhom && styles.groupActive]}
onPress={()=>setSelectedNhom(g.MaNhom)}
>
<Text>{g.TenNhom}</Text>
</TouchableOpacity>
))}


<TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
<Text style={styles.btnText}>Lưu</Text>
</TouchableOpacity>

<TouchableOpacity onPress={()=>setModalVisible(false)}>
<Text style={styles.close}>Đóng</Text>
</TouchableOpacity>

</ScrollView>
</Modal>

</View>
</MainLayout>
);
}


// ====================
// STYLE (GIỮ NGUYÊN)
// ====================
const styles=StyleSheet.create({
container:{flex:1,padding:15,backgroundColor:"#f4f6fb"},
topBar:{flexDirection:"row",marginBottom:15},
search:{flex:1,backgroundColor:"white",borderRadius:12,padding:12,marginRight:10,borderWidth:1,borderColor:"#ddd"},
addBtn:{backgroundColor:"#2f80ed",paddingHorizontal:18,justifyContent:"center",borderRadius:12},
btnText:{color:"white",fontWeight:"bold"},
card:{backgroundColor:"white",padding:16,borderRadius:18,marginBottom:14,elevation:4},
name:{fontSize:18,fontWeight:"bold",marginBottom:6},
rowBtns:{flexDirection:"row",marginTop:12},
editBtn:{flex:1,backgroundColor:"orange",padding:10,borderRadius:10,marginRight:8,alignItems:"center"},
delBtn:{flex:1,backgroundColor:"red",padding:10,borderRadius:10,alignItems:"center"},
pagination:{flexDirection:"row",justifyContent:"space-between",paddingVertical:15},
modal:{padding:25,backgroundColor:"white"},
titleModal:{fontSize:24,fontWeight:"bold",marginBottom:20,textAlign:"center"},
input:{borderWidth:1,borderColor:"#ddd",padding:12,borderRadius:12,marginBottom:12},
label:{fontWeight:"bold",marginBottom:8},
groupItem:{padding:12,borderWidth:1,borderColor:"#ddd",borderRadius:12,marginBottom:10},
groupActive:{backgroundColor:"#dbeafe"},
saveBtn:{backgroundColor:"green",padding:14,borderRadius:12,alignItems:"center",marginTop:20},
close:{textAlign:"center",color:"red",marginTop:20,fontSize:16},
genderRow:{flexDirection:"row",marginBottom:15}
});