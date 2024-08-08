const express = require('express');
const QRCode = require('qrcode');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = 3000;

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2017452071',
  database: 'controldeacceso'
});

// Conexión a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database.');
});

// Servir archivos estáticos desde la carpeta especificada
const publicDir = path.join('C:/Users/Apollosupport/qr');
app.use(express.static(publicDir));

// Ruta para la raíz del servidor (sirve el archivo index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Ruta para generar el QR
app.get('/generate-qr/:id', (req, res) => {
  const studentId = req.params.id;
  console.log('Received request for student ID:', studentId);

  // Consulta a la base de datos
  db.query('SELECT * FROM alumnos WHERE id = ?', [studentId], (err, result) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).send('Error querying the database.');
      return;
    }

    if (result.length === 0) {
      console.log('Student not found.');
      res.status(404).send('Student not found.');
      return;
    }

    const student = result[0];
    const qrData = `Matrícula: ${student.matricula}\nNombre: ${student.nombre}\nCorreo: ${student.correo}\nEstado: ${student.estado}`;
    console.log('QR data:', qrData);

    // Generar el código QR
    QRCode.toDataURL(qrData, (err, url) => {
      if (err) {
        console.error('Error generating QR code:', err);
        res.status(500).send('Error generating QR code.');
        return;
      }

      console.log('QR code generated successfully.');
      res.send(`<img src="${url}">`);
    });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
