// Logique interactive pour les maquettes du portfolio de Volonté Mukovi

document.addEventListener('DOMContentLoaded', () => {
    initCodeTerminal();
    initArduinoSimulator();
    initCampusFaceMockup();
    initSchoolManagerMockup();
});

/* ==========================================================================
   1. CODE TERMINAL INTERACTIF
   ========================================================================== */
const codeSnippets = {
    django: {
        filename: "views.py (Django Backend)",
        lang: "python",
        code: `from django.http import JsonResponse
from rest_framework.decorators import api_view
from .models import Student, Attendance
from .serializers import FaceRecognitionSerializer

@api_view(['POST'])
def verify_attendance(request):
    """
    API pour enregistrer la présence via reconnaissance faciale (CampusFace)
    """
    serializer = FaceRecognitionSerializer(data=request.data)
    if serializer.is_valid():
        face_id = serializer.validated_data['face_id']
        try:
            student = Student.objects.get(face_token=face_id)
            attendance = Attendance.objects.create(
                student=student, 
                status='PRESENT'
            )
            return JsonResponse({
                "status": "success",
                "student": student.full_name,
                "time": attendance.timestamp.strftime("%H:%M:%S")
            }, status=200)
        except Student.DoesNotExist:
            return JsonResponse({"error": "Étudiant non reconnu"}, status=404)
    return JsonResponse(serializer.errors, status=400)`,
        output: `[Django Server] Starting Django development server at http://127.0.0.1:8000/
[Django Server] Quit the server with CTRL-BREAK.
[Django Server] POST /api/attendance/verify_attendance - 200 OK (0.12s)
[Django Server] { "status": "success", "student": "Volonté Mukovi", "time": "08:30:12" }
[Django Server] POST /api/attendance/verify_attendance - 404 Not Found (0.08s)
[Django Server] { "error": "Étudiant non reconnu" }`
    },
    react: {
        filename: "AttendanceTracker.jsx (React Frontend)",
        lang: "javascript",
        code: `import React, { useState, useEffect } from 'react';
import CameraScanner from './CameraScanner';

export default function AttendanceTracker() {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);

  const handleFaceDetected = async (faceId) => {
    setStatus('scanning');
    try {
      const res = await fetch('/api/attendance/verify_attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ face_id: faceId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setLog(prev => [data, ...prev]);
      } else {
        setStatus('failed');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">CampusFace Scanner</h2>
      <CameraScanner onScan={handleFaceDetected} status={status} />
      <div className="mt-4">
        <h3 className="font-medium text-sm text-slate-500 mb-2">Logs de Présence</h3>
        {/* Render status & active logs */}
      </div>
    </div>
  );
}`,
        output: `[React app] Mounting <AttendanceTracker /> component...
[React app] Camera permission GRANTED.
[React app] Face detected! Token: face_volonte_991c
[React app] API call sent to /api/attendance/verify_attendance...
[React app] Received success response. Updating UI logs.
[React app] Log entry added: Volonté Mukovi - Présent à 08:30:12`
    },
    arduino: {
        filename: "sensor_node.ino (Arduino/ESP32)",
        lang: "cpp",
        code: `// Contrôle matériel et remontée de température
#include <WiFi.h>
#include <HTTPClient.h>

const int LED_PIN = 2;       // LED embarquée
const int SENSOR_PIN = 34;   // Capteur connecté à A0
const int BUTTON_PIN = 4;    // Bouton poussoir

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  
  Serial.println("Initialisation du système...");
}

void loop() {
  int buttonState = digitalRead(BUTTON_PIN);
  int sensorValue = analogRead(SENSOR_PIN);
  float voltage = sensorValue * (3.3 / 4095.0);
  float temperature = voltage * 100.0; // Calibration fictive LM35
  
  if (buttonState == LOW || temperature > 35.0) {
    digitalWrite(LED_PIN, HIGH); // Alarme active
    Serial.printf("[ALERT] Temp: %.2fC | Bouton: PRESSE\\n", temperature);
  } else {
    digitalWrite(LED_PIN, LOW);
    Serial.printf("[INFO] Temp: %.2fC | Status: OK\\n", temperature);
  }
  delay(1000);
}`,
        output: `[Arduino] Initialisation du système...
[Arduino] WiFi connected to UNILUK_STUDENT_NET
[Arduino] [INFO] Temp: 24.50C | Status: OK
[Arduino] [INFO] Temp: 24.80C | Status: OK
[Arduino] [ALERT] Temp: 38.10C | Status: OVERHEAT! LED active.
[Arduino] [ALERT] Bouton PRESSE -> Alarme forcée.`
    }
};

function initCodeTerminal() {
    const tabs = document.querySelectorAll('.terminal-tab');
    const codeArea = document.getElementById('terminal-code');
    const terminalOutput = document.getElementById('terminal-output');
    const runBtn = document.getElementById('btn-run-code');
    let currentTab = 'django';

    function loadTab(tabKey) {
        currentTab = tabKey;
        tabs.forEach(t => {
            if (t.dataset.tab === tabKey) {
                t.classList.add('bg-slate-700', 'text-white');
                t.classList.remove('text-slate-400');
            } else {
                t.classList.remove('bg-slate-700', 'text-white');
                t.classList.add('text-slate-400');
            }
        });
        
        // Sécuriser l'insertion du code
        codeArea.textContent = codeSnippets[tabKey].code;
        terminalOutput.textContent = `Cliquez sur "Lancer l'application" pour voir le terminal s'exécuter...`;
    }

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            loadTab(tab.dataset.tab);
        });
    });

    runBtn.addEventListener('click', () => {
        terminalOutput.textContent = "Compilation et lancement en cours...\n";
        let outputLines = codeSnippets[currentTab].output.split('\n');
        let lineIdx = 0;
        
        const interval = setInterval(() => {
            if (lineIdx < outputLines.length) {
                terminalOutput.textContent += outputLines[lineIdx] + '\n';
                terminalOutput.scrollTop = terminalOutput.scrollHeight;
                lineIdx++;
            } else {
                clearInterval(interval);
            }
        }, 150);
    });

    // Charger par défaut
    loadTab('django');
}

/* ==========================================================================
   2. SIMULATEUR ARDUINO INTERACTIF
   ========================================================================== */
function initArduinoSimulator() {
    const btnPress = document.getElementById('arduino-btn-press');
    const tempSlider = document.getElementById('arduino-temp-slider');
    const tempVal = document.getElementById('arduino-temp-val');
    const ledRed = document.getElementById('arduino-led-red');
    const serialConsole = document.getElementById('arduino-serial-console');

    function logSerial(message) {
        const time = new Date().toLocaleTimeString();
        serialConsole.innerHTML += `<div class="text-xs font-mono"><span class="text-slate-500">[${time}]</span> ${message}</div>`;
        serialConsole.scrollTop = serialConsole.scrollHeight;
    }

    btnPress.addEventListener('mousedown', () => {
        btnPress.classList.add('bg-red-700', 'scale-95');
        ledRed.classList.add('bg-red-500', 'led-glow-red');
        ledRed.classList.remove('bg-red-950');
        logSerial("<span class='text-amber-400'>[Bouton]</span> État: APPUYÉ (Goupille 4 -> LOW) -> LED Allumée");
    });

    btnPress.addEventListener('mouseup', () => {
        btnPress.classList.remove('bg-red-700', 'scale-95');
        checkStates();
    });

    // Gérer les cas où la souris quitte le bouton pendant le clic
    btnPress.addEventListener('mouseleave', () => {
        btnPress.classList.remove('bg-red-700', 'scale-95');
        checkStates();
    });

    tempSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        tempVal.textContent = val;
        checkStates();
    });

    function checkStates() {
        const temp = parseFloat(tempSlider.value);
        let ledState = false;

        if (temp > 35.0) {
            ledState = true;
            ledRed.classList.add('bg-red-500', 'led-glow-red');
            ledRed.classList.remove('bg-red-950');
            logSerial(`<span class='text-red-500'>[ALERTE]</span> Température trop haute (${temp}°C) -> LED Allumée !`);
        } else {
            // Sauf si le bouton est maintenu (ce qui sera géré par mouseup/mouseleave)
            ledRed.classList.remove('bg-red-500', 'led-glow-red');
            ledRed.classList.add('bg-red-950');
            logSerial(`<span class='text-emerald-400'>[Capteur]</span> Température: ${temp}°C (Statut: Normal)`);
        }
    }
}

/* ==========================================================================
   3. MAQUETTE CAMPUSFACE (RECONNAISSANCE FACIALE)
   ========================================================================== */
function initCampusFaceMockup() {
    const btnScan = document.getElementById('cf-btn-scan');
    const scanLine = document.getElementById('cf-scan-line');
    const statusText = document.getElementById('cf-status-text');
    const statusDot = document.getElementById('cf-status-dot');
    const faceBox = document.getElementById('cf-face-box');
    const logList = document.getElementById('cf-log-list');

    const mockStudents = [
        { name: "Kambale Mukovi Volonté VD", matricule: "ULK/2022/3092" },
        { name: "Kavira Masika Divine", matricule: "ULK/2023/1029" },
        { name: "Kakule Paluku Jean", matricule: "ULK/2021/4491" },
        { name: "Katungu Syatsimwa Grace", matricule: "ULK/2022/2918" }
    ];

    btnScan.addEventListener('click', () => {
        btnScan.disabled = true;
        btnScan.textContent = "Recherche faciale...";
        scanLine.classList.remove('hidden');
        faceBox.classList.remove('border-emerald-400', 'border-red-400');
        faceBox.classList.add('border-indigo-400');
        
        statusText.textContent = "Analyse faciale en cours...";
        statusDot.className = "w-2 h-2 rounded-full bg-amber-500 animate-pulse";

        setTimeout(() => {
            // Fin du scan
            scanLine.classList.add('hidden');
            const student = mockStudents[Math.floor(Math.random() * mockStudents.length)];
            
            faceBox.classList.remove('border-indigo-400');
            faceBox.classList.add('border-emerald-400');
            
            statusText.textContent = "Authentifié !";
            statusDot.className = "w-2 h-2 rounded-full bg-emerald-500";
            
            // Ajouter aux logs
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0];
            const newLog = document.createElement('div');
            newLog.className = "flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-100 text-xs animation-fade-in";
            newLog.innerHTML = `
                <div>
                    <span class="font-medium text-slate-800 block">${student.name}</span>
                    <span class="text-[10px] text-slate-400">${student.matricule}</span>
                </div>
                <div class="text-right">
                    <span class="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-semibold">PRÉSENT</span>
                    <span class="text-[10px] text-slate-400 block mt-0.5">${timeStr}</span>
                </div>
            `;
            logList.insertBefore(newLog, logList.firstChild);
            
            // Limiter à 4 logs affichés
            if (logList.children.length > 4) {
                logList.removeChild(logList.lastChild);
            }
            
            btnScan.disabled = false;
            btnScan.textContent = "Simuler Présence";
        }, 2200);
    });
}

/* ==========================================================================
   4. MAQUETTE SCHOOLMANAGER (TABLEAU DE BORD)
   ========================================================================== */
function initSchoolManagerMockup() {
    const searchInput = document.getElementById('sm-search');
    const tableBody = document.getElementById('sm-table-body');
    const btnAddStudent = document.getElementById('sm-btn-add');
    const studentCount = document.getElementById('sm-student-count');

    let students = [
        { id: "001", name: "Muhindo Kambere Moise", class: "G1 Informatique", status: "Payé" },
        { id: "002", name: "Kahambu Kyakimwa Alice", class: "G2 Droit", status: "Tranche 1" },
        { id: "003", name: "Paluku Ndungo David", class: "G3 Economie", status: "Non payé" },
        { id: "004", name: "Kambale Mukovi Volonté VD", class: "L2 Informatique", status: "Payé" },
        { id: "005", name: "Kasereka Mwanawavene", class: "G1 Médecine", status: "Payé" }
    ];

    function renderStudents(filteredStudents) {
        tableBody.innerHTML = '';
        if (filteredStudents.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="px-4 py-6 text-center text-sm text-slate-400">Aucun étudiant trouvé</td></tr>`;
            return;
        }

        filteredStudents.forEach(st => {
            let statusBadge = '';
            if (st.status === 'Payé') {
                statusBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">En Règle</span>';
            } else if (st.status === 'Tranche 1') {
                statusBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full">Partiel</span>';
            } else {
                statusBadge = '<span class="px-2 py-0.5 text-[10px] font-semibold bg-red-100 text-red-800 rounded-full">En Retard</span>';
            }

            const tr = document.createElement('tr');
            tr.className = "border-t border-slate-100 hover:bg-slate-50 transition";
            tr.innerHTML = `
                <td class="px-4 py-2.5 text-xs font-mono text-slate-500">${st.id}</td>
                <td class="px-4 py-2.5 text-xs font-medium text-slate-800">${st.name}</td>
                <td class="px-4 py-2.5 text-xs text-slate-600">${st.class}</td>
                <td class="px-4 py-2.5 text-xs">${statusBadge}</td>
            `;
            tableBody.appendChild(tr);
        });
        studentCount.textContent = students.length;
    }

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = students.filter(st => 
            st.name.toLowerCase().includes(query) || 
            st.class.toLowerCase().includes(query) || 
            st.id.includes(query)
        );
        renderStudents(filtered);
    });

    btnAddStudent.addEventListener('click', () => {
        const newNames = [
            "Kavira Vutsura Sifa",
            "Mumbere Malisawa Prince",
            "Kakule Tsongo Christian",
            "Masika Kirerene Deborah"
        ];
        const newClasses = ["G1 Informatique", "G2 Droit", "G3 Sciences", "L1 Gestion"];
        const newStatuses = ["Payé", "Tranche 1", "Non payé"];

        const randomName = newNames[Math.floor(Math.random() * newNames.length)];
        const randomClass = newClasses[Math.floor(Math.random() * newClasses.length)];
        const randomStatus = newStatuses[Math.floor(Math.random() * newStatuses.length)];
        const nextId = String(students.length + 1).padStart(3, '0');

        // Éviter les doublons exacts rapides pour la démo
        if (students.some(s => s.name === randomName)) {
            return;
        }

        students.push({
            id: nextId,
            name: randomName,
            class: randomClass,
            status: randomStatus
        });

        renderStudents(students);
        // Reset search field
        searchInput.value = '';
    });

    // Initial render
    renderStudents(students);
}
