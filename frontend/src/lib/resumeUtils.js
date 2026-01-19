import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Download resume as PDF using jsPDF and html2canvas
 * @param {string} resumeName - Name of the resume
 * @param {HTMLElement} element - DOM element containing the resume
 */
export const downloadPDF = async (resumeName, element) => {
  if (!element) {
    console.error('No element provided for PDF export');
    return;
  }

  try {
    // Create canvas from HTML
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add pages if content exceeds one page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${resumeName || 'resume'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Print resume
 * @param {HTMLElement} element - DOM element containing the resume
 */
export const printResume = (element) => {
  if (!element) {
    console.error('No element provided for printing');
    return;
  }

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(element.outerHTML);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

/**
 * Export resume as JSON
 * @param {Object} resume - Resume data object
 * @param {string} fileName - Name of the file
 */
export const exportJSON = (resume, fileName = 'resume.json') => {
  const dataStr = JSON.stringify(resume, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import resume from JSON file
 * @param {File} file - JSON file
 * @returns {Promise<Object>} Parsed resume data
 */
export const importJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

/**
 * Validate resume data
 * @param {Object} resume - Resume data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateResume = (resume) => {
  const errors = [];

  if (!resume.personalDetails.fullName?.trim()) {
    errors.push('Full name is required');
  }
  if (!resume.personalDetails.email?.trim()) {
    errors.push('Email is required');
  }
  if (!resume.personalDetails.phone?.trim()) {
    errors.push('Phone number is required');
  }
  if (resume.experience.length === 0) {
    errors.push('At least one experience entry is required');
  }
  if (resume.education.length === 0) {
    errors.push('At least one education entry is required');
  }
  if (resume.skills.length === 0) {
    errors.push('At least one skill is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
