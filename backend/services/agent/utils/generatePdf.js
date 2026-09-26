import { PDFDocument } from "pdfkit";

const generatePdf=async (data)=>{
    return new Promise((resolve,reject)=>{
        const doc = new PDFDocument({
            size:"A4",
            margin:50,
            info:{
                Author:"CortexAI",
                Title:data.title,
                Creator:"CortexAi"
            }
        });

const chunks=[]
doc.on("")

    })
}