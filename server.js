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

app.post('/get-student-info', async (req, res) => {
  const { registrationNumber } = req.body;
  
  try {
    // Define paths for all three Excel files
    const excelPath1 = path.join(__dirname, 'students23.xlsx');
    const excelPath2 = path.join(__dirname, 'students24.xlsx');
    const excelPath3 = path.join(__dirname, 'students22.xlsx');

    // Read all Excel files
    const workbook1 = xlsx.readFile(excelPath1);
    const workbook2 = xlsx.readFile(excelPath2);
    const workbook3 = xlsx.readFile(excelPath3);

    // Get worksheets from all files
    const worksheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
    const worksheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
    const worksheet3 = workbook3.Sheets[workbook3.SheetNames[0]];

    // Convert worksheets to JSON
    const students1 = xlsx.utils.sheet_to_json(worksheet1);
    const students2 = xlsx.utils.sheet_to_json(worksheet2);
    const students3 = xlsx.utils.sheet_to_json(worksheet3);

    // Search in first Excel file
    let student = students1.find(s => String(s.RegistrationNumber) === String(registrationNumber));
    let sourceFile = 'students1';

    if (student) {
      const formattedStudent = {
        Name: student.Name.trim(),
        RegistrationNumber: student.RegistrationNumber,
        Course: student.Course,
        State: student.State,
        CGPA: student.CGPA,
        Gender: student.Gender,
        BatchYear: student.BatchYear,
        Country: student.Country,
        Rank: calculateRank(students1, student),
        Percentage: calculatePercentage(students1, student),
        TotalStudents: students1.length  // Only showing total from first file
      };
      
      console.log('Found student in first file:', formattedStudent);
      res.json(formattedStudent);
    } else {
      student = students2.find(s => String(s.RegistrationNumber) === String(registrationNumber));
      sourceFile = 'students2';

      if (student) {
        const formattedStudent = {
          Name: student.Name.trim(),
          RegistrationNumber: student.RegistrationNumber,
          Course: student.Course,
          State: student.State,
          CGPA: student.CGPA,
          Gender: student.Gender,
          BatchYear: student.BatchYear,
          Section: student.Section,
          Rank: calculateRank(students2, student),
          Percentage: calculatePercentage(students2, student),
          TotalStudents: students2.length  // Only showing total from second file
        };
        
        console.log('Found student in second file:', formattedStudent);
        res.json(formattedStudent);
      } else {
        student = students3.find(s => String(s.RegistrationNumber) === String(registrationNumber));
        sourceFile = 'students3';

        if (student) {
          const formattedStudent = {
            Name: student.Name.trim(),
            RegistrationNumber: student.RegistrationNumber,
            Course: student.Course,
            State: student.State,
            CGPA: student.CGPA,
            Gender: student.Gender,
            BatchYear: student.BatchYear,
            Section: student.Section,
            Rank: calculateRank(students3, student),
            Percentage: calculatePercentage(students3, student),
            TotalStudents: students3.length  // Only showing total from third file
          };
          
          console.log('Found student in third file:', formattedStudent);
          res.json(formattedStudent);
        } else {
          console.log('No student found in any file with registration number:', registrationNumber);
          res.status(404).json({ error: 'Student not found' });
        }
      }
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