import api from "../../utils/axios"

 const createOrder=async(payload)=>{
    try {
        const {data} = await api.post("/api/billing/create",payload)
        console.log(data);
        return data
    } catch (error) {
        console.log(error)
    }
}
export default createOrder;