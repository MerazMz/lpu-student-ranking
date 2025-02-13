const express = require('express');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/get-student-info', (req, res) => {
  const { registrationNumber } = req.body;
  
  try {
    const excelPath = path.join(__dirname, 'students.xlsx');
    console.log('Reading Excel file from:', excelPath);

    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const students = xlsx.utils.sheet_to_json(worksheet);

    // Changed to match Excel column name "RegistrationNumber"
    const student = students.find(s => String(s.RegistrationNumber) === String(registrationNumber));

    if (student) {
      // Format the response to match your frontend expectations
      const formattedStudent = {
        Name: student.Name.trim(),
        RegistrationNumber: student.RegistrationNumber,
        Course: student.Course,
        State: student.State,
        CGPA: student.CGPA,
        Gender: student.Gender,
        BatchYear: student.BatchYear,
        Country: student.Country,
        Rank: calculateRank(students, student),
        Percentage: calculatePercentage(students, student),
      };
      
      console.log('Found student:', formattedStudent);
      res.json(formattedStudent);
    } else {
      console.log('No student found with registration number:', registrationNumber);
      res.status(404).json({ error: 'Student not found' });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
});

//Function to calculate rank based on CGPA
function calculateRank(students, currentStudent) {
  // Sort students by CGPA in descending order
  const sortedStudents = [...students].sort((a, b) => b.Cgpa - a.Cgpa);
  // Find the position of current student
  const rank = sortedStudents.findIndex(s => s.RegistrationNumber === currentStudent.RegistrationNumber) + 1;
  return rank;
}
//top percentage
function calculatePercentage(students, currentStudent) {
  const totalStudents = students.length;
  const rank = calculateRank(students, currentStudent);
  const percentage = ((totalStudents - rank) / totalStudents) * 100;
  const topPercentage = 100-percentage;
  return topPercentage.toFixed(2);
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});