import React, { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "../../../contexts/TranslationContext";

const DUMMY_SERVICES_EN = [
  "Form A - Electrical Installations - Other than Overhead Line",
  "Form B - Electrical Installations - Overhead Line",
  "Form C - Electrical Installations with Overhead Line",
  "Generating Set Energization (Permission for charging Diesel Generator Sets)",
  "Generating Set Plan Approval (Layout Approvals for DG sets)",
  "Generating Set Registration (Registration of Diesel Generator Sets)",
  "Grant of Permission for erection of lift and License to operate a lift",
  "New electricity connection and power feasibility certificate",
  "Authorization under Construction and Demolition Waste Management Rules, 2016",
  "Authorization under Hazardous Waste Rule"
];

const DUMMY_SERVICES_MR = [
  "फॉर्म ए - विद्युत प्रतिष्ठापने - ओव्हरहेड लाईन व्यतिरिक्त",
  "फॉर्म बी - विद्युत प्रतिष्ठापने - ओव्हरहेड लाईन",
  "फॉर्म सी - ओव्हरहेड लाईनसह विद्युत प्रतिष्ठापने",
  "जनरेटिंग सेट चार्जिंग परवानगी (डिझेल जनरेटर सेटसाठी परवानगी)",
  "जनरेटिंग सेट आराखडा मंजुरी (डीजी सेटसाठी लेआउट मंजुरी)",
  "जनरेटिंग सेट नोंदणी (डिझेल जनरेटर सेट नोंदणी)",
  "लिफ्ट उभारणी परवानगी आणि लिफ्ट चालवण्याचा परवाना",
  "नवीन वीज जोडणी आणि वीज व्यवहार्यता प्रमाणपत्र",
  "बांधकाम आणि पाडकाम कचरा व्यवस्थापन नियम, २०१६ अंतर्गत प्राधिकृतता",
  "घातक कचरा नियमांतर्गत प्राधिकृतता"
];

const DUMMY_SERVICES_HI = [
  "फॉर्म ए - विद्युत अधिष्ठापन - ओवरहेड लाइन के अलावा",
  "फॉर्म बी - विद्युत अधिष्ठापन - ओवरहेड लाइन",
  "फॉर्म सी - ओवरहेड लाइन के साथ विद्युत अधिष्ठापन",
  "जनरेटिंग सेट चार्जिंग अनुमति (डीजल जनरेटर सेट हेतु अनुमति)",
  "जनरेटिंग सेट योजना अनुमोदन (डीजी सेट लेआउट अनुमोदन)",
  "जनरेटिंग सेट पंजीकरण (डीजल जनरेटर सेट पंजीकरण)",
  "लिफ्ट लगाने की अनुमति एवं लिफ्ट संचालन लाइसेंस",
  "नया बिजली कनेक्शन एवं व्यवहार्यता प्रमाण पत्र",
  "निर्माण एवं विध्वंस अपशिष्ट प्रबंधन नियम, 2016 के तहत प्राधिकरण",
  "खतरनाक अपशिष्ट नियमों के तहत प्राधिकरण"
];

const DEPARTMENTS = [
  { 
    deptEn: "Energy Department", deptMr: "ऊर्जा विभाग", deptHi: "ऊर्जा विभाग", 
    subEn: "Electrical Inspectorate", subMr: "विद्युत निरीक्षक कार्यालय", subHi: "विद्युत निरीक्षणालय" 
  },
  { 
    deptEn: "Environment Department", deptMr: "पर्यावरण विभाग", deptHi: "पर्यावरण विभाग", 
    subEn: "Maharashtra Pollution Control Board", subMr: "महाराष्ट्र प्रदूषण नियंत्रण मंडळ (MPCB)", subHi: "महाराष्ट्र प्रदूषण नियंत्रण बोर्ड" 
  },
  { 
    deptEn: "Labour Department", deptMr: "कामगार विभाग", deptHi: "श्रम विभाग", 
    subEn: "Directorate of Industrial Safety and Health", subMr: "औद्योगिक सुरक्षा व आरोग्य संचालनालय (DISH)", subHi: "औद्योगिक सुरक्षा एवं स्वास्थ्य निदेशालय" 
  },
  { 
    deptEn: "Revenue Department", deptMr: "महसूल विभाग", deptHi: "राजस्व विभाग", 
    subEn: "District Collector Office", subMr: "जिल्हाधिकारी कार्यालय", subHi: "जिला कलेक्टर कार्यालय" 
  },
  { 
    deptEn: "MIDC", deptMr: "एमआयडीसी", deptHi: "एमआईडीसी", 
    subEn: "Maharashtra Industrial Development Corporation", subMr: "महाराष्ट्र औद्योगिक विकास महामंडळ", subHi: "महाराष्ट्र औद्योगिक विकास निगम" 
  }
];

export function ServicesAvailable() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { t, lang } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = 10;
  const totalItems = 100;

  const servicesList = lang === "mr" ? DUMMY_SERVICES_MR : lang === "hi" ? DUMMY_SERVICES_HI : DUMMY_SERVICES_EN;

  const currentData = Array.from({ length: itemsPerPage }).map((_, index) => {
    const srNo = (currentPage - 1) * itemsPerPage + index + 1;
    const deptObj = DEPARTMENTS[srNo % DEPARTMENTS.length];
    const serviceName = servicesList[index % servicesList.length];

    return {
      srNo,
      department: lang === "mr" ? deptObj.deptMr : lang === "hi" ? deptObj.deptHi : deptObj.deptEn,
      subDepartment: lang === "mr" ? deptObj.subMr : lang === "hi" ? deptObj.subHi : deptObj.subEn,
      serviceName: srNo <= 10 ? serviceName : `${serviceName} - (${srNo})`
    };
  });

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white min-h-screen p-8 text-sm font-sans" style={{ color: "#333" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADING */}
        <div className="mb-6 border-b-2 border-gray-100 pb-2 flex">
          <h2 className="text-xl font-bold" style={{ color: "#0F766E", borderBottom: "3px solid #0F766E", marginBottom: "-11px", paddingBottom: "8px" }}>
            {lang === "mr" ? "उपलब्ध सेवांची यादी" : lang === "hi" ? "उपलब्ध सेवाओं की सूची" : "LIST OF SERVICES"}
          </h2>
        </div>

        {/* FILTER BOX */}
        <div className="border border-gray-200 p-6 rounded mb-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                {lang === "mr" ? "विभाग निवडा" : lang === "hi" ? "विभाग चुनें" : "Select Department"}
              </label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-400">
                <option>------{lang === "mr" ? "निवडा" : lang === "hi" ? "चुनें" : "Select"}----</option>
                {DEPARTMENTS.map((d, i) => (
                  <option key={i}>{lang === "mr" ? d.deptMr : lang === "hi" ? d.deptHi : d.deptEn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                {lang === "mr" ? "उप-विभाग निवडा" : lang === "hi" ? "उप-विभाग चुनें" : "Select Sub-Department"}
              </label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-400">
                <option>------{lang === "mr" ? "निवडा" : lang === "hi" ? "चुनें" : "Select"}----</option>
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button className="bg-[#198754] text-white px-5 py-1.5 rounded hover:bg-[#157347] transition-colors">
              {lang === "mr" ? "शोधा" : lang === "hi" ? "खोजें" : "Search"}
            </button>
            <button className="bg-[#dc3545] text-white px-5 py-1.5 rounded hover:bg-[#bb2d3b] transition-colors">
              {lang === "mr" ? "रीसेट करा" : lang === "hi" ? "रीसेट करें" : "Reset"}
            </button>
          </div>
        </div>

        {/* TOP ACTIONS (Export & Search) */}
        <div className="flex justify-between items-center mb-3">
          <button className="bg-[#6f42c1] text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-[#59339d] transition-colors shadow-sm">
            {lang === "mr" ? "एक्सेलमध्ये एक्सपोर्ट करा" : lang === "hi" ? "एक्सेल में निर्यात करें" : "Export to Excel"}
          </button>
          <div className="flex items-center gap-2">
            <label className="text-gray-600">{lang === "mr" ? "शोधा:" : lang === "hi" ? "खोजें:" : "Search:"}</label>
            <input 
              type="text" 
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-gray-400 w-48"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto border-t border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-700">
                <th className="py-3 px-4 font-bold w-16">{lang === "mr" ? "अ.क्र." : lang === "hi" ? "क्र.सं." : "Sr.No"}</th>
                <th className="py-3 px-4 font-bold flex items-center justify-between cursor-pointer group">
                  {lang === "mr" ? "विभागाचे नाव" : lang === "hi" ? "विभाग का नाम" : "Department Name"}
                  <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                </th>
                <th className="py-3 px-4 font-bold">
                  <div className="flex items-center justify-between cursor-pointer group">
                    {lang === "mr" ? "उप-विभागाचे नाव" : lang === "hi" ? "उप-विभाग का नाम" : "Sub-Department Name"}
                    <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </th>
                <th className="py-3 px-4 font-bold">{lang === "mr" ? "सेवेचे नाव" : lang === "hi" ? "सेवा का नाम" : "Service Name"}</th>
                <th className="py-3 px-4 font-bold text-center">
                  <div className="flex items-center justify-center gap-2 cursor-pointer group">
                    {lang === "mr" ? "अर्ज" : lang === "hi" ? "आवेदन" : "Apply"}
                    <ChevronsUpDown size={14} className="text-gray-300 group-hover:text-gray-500" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, idx) => (
                <tr 
                  key={row.srNo} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'}`}
                >
                  <td className="py-3 px-4">{row.srNo}</td>
                  <td className="py-3 px-4">{row.department}</td>
                  <td className="py-3 px-4">{row.subDepartment}</td>
                  <td className="py-3 px-4 pr-12">{row.serviceName}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => currentUser ? navigate('/app/apply') : navigate('/login')}
                      className="bg-[#198754] text-white px-3 py-1 text-xs rounded hover:bg-[#157347] transition-colors whitespace-nowrap shadow-sm"
                    >
                      {lang === "mr" ? "आता अर्ज करा" : lang === "hi" ? "अब आवेदन करें" : "Apply Now"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-between items-center mt-4 text-gray-600 text-sm">
          <div>
            {lang === "mr" 
              ? `${totalItems} पैकी ${(currentPage - 1) * itemsPerPage + 1} ते ${currentPage * itemsPerPage} नोंदी दर्शवित आहे`
              : lang === "hi"
              ? `${totalItems} में से ${(currentPage - 1) * itemsPerPage + 1} से ${currentPage * itemsPerPage} प्रविष्टियाँ दिखा रहा है`
              : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${currentPage * itemsPerPage} of ${totalItems} entries`}
          </div>
          <div className="flex border border-gray-200 rounded">
            <button 
              className={`px-3 py-1.5 border-r border-gray-200 hover:bg-gray-50 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {lang === "mr" ? "मागील" : lang === "hi" ? "पिछला" : "Previous"}
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button 
                  key={pageNum}
                  className={`px-3 py-1.5 border-r border-gray-200 hover:bg-gray-50 ${currentPage === pageNum ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-600'}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button 
              className={`px-3 py-1.5 hover:bg-gray-50 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {lang === "mr" ? "पुढील" : lang === "hi" ? "अगला" : "Next"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
