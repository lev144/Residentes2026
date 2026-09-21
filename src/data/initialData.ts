import { Patient } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-01',
    bedNumber: 1,
    firstName: 'Mateo',
    lastName: 'Morales Ruiz',
    ageYears: 7,
    ageMonths: 2,
    gender: 'M',
    admissionDate: '2026-09-18', // 3 días
    primaryDiagnosis: 'Apendicitis aguda flemosa perforada',
    diagnoses: [
      'Apendicitis aguda perforada c/ peritonitis localizada',
      'Post-apendicectomía laparoscópica Día 2',
      'Deshidratación leve corregida'
    ],
    surgicalProcedure: 'Apendicectomía laparoscópica + lavado peritoneal',
    postOpDay: 2,
    currentPlans: 'Ampicilina/Sulbactam + Metronidazol IV. Manejo del dolor con Paracetamol c/8h. Tolerancia oral a líquidos claros iniciada hoy.',
    pendingPlans: 'Ecografía de control por dolor residual en fosa ilíaca derecha a las 15:00. Retiro de vía periférica si tolera dieta blanda mañana.',
    status: 'observacion',
    dietStatus: 'Líquidos orales tolerados',
    avatarSticker: 'lion',
    bloodType: 'O+',
    allergies: 'Ninguna conocida',
    vitals: { heartRate: 98, bloodPressure: '100/65', respiratoryRate: 20, oxygenSaturation: 99, temperature: 37.2 }
  },
  {
    id: 'pat-02',
    bedNumber: 2,
    firstName: 'Sofía',
    lastName: 'Gómez Viteri',
    ageYears: 3,
    ageMonths: 5,
    gender: 'F',
    admissionDate: '2026-09-19', // 2 días
    primaryDiagnosis: 'Invaginación intestinal ileocólica',
    diagnoses: [
      'Invaginación ileocólica resuelta por enema hidrostático eco-guiado',
      'Dolor cólico abdominal en resolución'
    ],
    surgicalProcedure: 'Reducción hidrostática ecodirigida sin laparotomía',
    postOpDay: 1,
    currentPlans: 'Reposo relativo. Dieta blanda fraccionada. Control estricto de deposiciones y vómitos.',
    pendingPlans: 'Observación por 24h para descartar recidiva de invaginación. Alta hospitalaria probable hoy a las 18:00 si continúa asintomática.',
    status: 'estable',
    dietStatus: 'Dieta blanda pediátrica',
    avatarSticker: 'rabbit',
    bloodType: 'A+',
    allergies: 'Penicilina (rash dérmico)',
    vitals: { heartRate: 104, bloodPressure: '95/60', respiratoryRate: 22, oxygenSaturation: 98, temperature: 36.8 }
  },
  {
    id: 'pat-03',
    bedNumber: 3,
    firstName: 'Lucas',
    lastName: 'Benítez Paz',
    ageYears: 0,
    ageMonths: 11,
    gender: 'M',
    admissionDate: '2026-09-15', // 6 días
    primaryDiagnosis: 'Atresia esofágica c/ fístula traqueoesofágica distal (Tipo III)',
    diagnoses: [
      'Atresia esofágica Tipo III corregida quirúrgicamente',
      'Post-toracotomía y anastomosis esofágica término-terminal Día 5',
      'Neumonía química post-aspirativa en resolución',
      'Sepsis neonatal tardía en control'
    ],
    surgicalProcedure: 'Cierre de fístula traqueoesofágica + anastomosis esofágica primaria',
    postOpDay: 5,
    currentPlans: 'Ceftriaxona + Vancomicina IV. Nutrición parenteral total (NPT) continua por catéter venoso central. Dren pleural a sello de agua con gasto serohemático 10 ml/24h.',
    pendingPlans: 'Esofagograma hidrosoluble de control programado para mañana para descartar filtración de anastomosis antes de iniciar prueba de deglución.',
    status: 'critico',
    dietStatus: 'Ayuno absoluto (NPT por CVC)',
    avatarSticker: 'bear',
    bloodType: 'B+',
    allergies: 'Ninguna conocida',
    vitals: { heartRate: 142, bloodPressure: '82/48', respiratoryRate: 36, oxygenSaturation: 95, temperature: 38.1 }
  },
  {
    id: 'pat-04',
    bedNumber: 4,
    firstName: 'Valentina',
    lastName: 'Mendoza Ríos',
    ageYears: 5,
    ageMonths: 8,
    gender: 'F',
    admissionDate: '2026-09-19', // 2 días
    primaryDiagnosis: 'Fractura supracondílea de codo izquierdo Gartland III',
    diagnoses: [
      'Fractura supracondílea desplazada codo izquierdo',
      'Post-reducción cerrada y osteosíntesis con clavijas percutáneas (Kirschner)',
      'Inmovilización con valva de yeso braquiopalmar'
    ],
    surgicalProcedure: 'Reducción cerrada + colocación de clavos de Kirschner',
    postOpDay: 1,
    currentPlans: 'Cefazolina profiláctica IV. Analgesia con Ibuprofeno + Paracetamol. Elevación de miembro superior izquierdo.',
    pendingPlans: 'Control neurovascular distal cada turno (llenado capilar < 2s, pulso radial). Radiografía de control de codo a las 11:00.',
    status: 'estable',
    dietStatus: 'Dieta completa para la edad',
    avatarSticker: 'star',
    bloodType: 'O+',
    allergies: 'Ninguna',
    vitals: { heartRate: 92, bloodPressure: '102/64', respiratoryRate: 19, oxygenSaturation: 100, temperature: 36.6 }
  },
  {
    id: 'pat-05',
    bedNumber: 5,
    firstName: 'Santiago',
    lastName: 'Castro Peña',
    ageYears: 0,
    ageMonths: 2,
    gender: 'M',
    admissionDate: '2026-09-18', // 3 días
    primaryDiagnosis: 'Estenosis hipertrófica de píloro',
    diagnoses: [
      'Estenosis hipertrófica de píloro confirmada por ecografía',
      'Alcalosis metabólica hipoclorémica corregida con hidratación IV',
      'Post-piloromiotomía extramucosa de Fredet-Ramstedt laparoscópica'
    ],
    surgicalProcedure: 'Piloromiotomía laparoscópica de Fredet-Ramstedt',
    postOpDay: 2,
    currentPlans: 'Progresión de tomas de leche materna / fórmula (30 ml cada 3 horas). Cero episodios eméticos en últimas 12h.',
    pendingPlans: 'Evaluar incremento a volumen pleno (60 ml c/3h). Alta a domicilio si mantiene tolerancia y adecuado incremento ponderal.',
    status: 'estable',
    dietStatus: 'Fórmula maternizada fraccionada',
    avatarSticker: 'dino',
    bloodType: 'O+',
    allergies: 'Ninguna',
    vitals: { heartRate: 128, bloodPressure: '80/50', respiratoryRate: 32, oxygenSaturation: 99, temperature: 36.9 }
  },
  {
    id: 'pat-06',
    bedNumber: 6,
    firstName: 'Camila',
    lastName: 'Torres Silva',
    ageYears: 8,
    ageMonths: 4,
    gender: 'F',
    admissionDate: '2026-09-17', // 4 días
    primaryDiagnosis: 'Trauma abdominal cerrado - Laceración esplénica Grado II',
    diagnoses: [
      'Traumatismo abdominal cerrado por caída de bicicleta',
      'Laceración esplénica Grado II subcapsular',
      'Manejo No Operatorio (MNO) en cama pediátrica'
    ],
    surgicalProcedure: 'Manejo conservador no operatorio protocolizado',
    postOpDay: undefined,
    currentPlans: 'Reposo absoluto en cama en decúbito supino. Monitorización seriada de hematocrito c/12h. Control de dolor.',
    pendingPlans: 'Control de hemoglobina y hematocrito a las 14:00 (último Hto 34%). Si estable, iniciar deambulación asistida mañana.',
    status: 'observacion',
    dietStatus: 'Dieta líquida amplia',
    avatarSticker: 'rocket',
    bloodType: 'A-',
    allergies: 'Dipirona / Metamizol',
    vitals: { heartRate: 88, bloodPressure: '105/68', respiratoryRate: 18, oxygenSaturation: 98, temperature: 37.0 }
  },
  {
    id: 'pat-07',
    bedNumber: 7,
    firstName: 'Thiago',
    lastName: 'Vargas Ortiz',
    ageYears: 4,
    ageMonths: 1,
    gender: 'M',
    admissionDate: '2026-09-14', // 7 días (Estancia prolongada)
    primaryDiagnosis: 'Quemadura térmica de 2do grado profundo (15% SCT)',
    diagnoses: [
      'Quemadura térmica por agua caliente en tórax anterior y extremidad superior derecha',
      'Post-escarectomía tangencial y colocación de apósito biológico',
      'Riesgo de infección de herida por Pseudomonas'
    ],
    surgicalProcedure: 'Aseo quirúrgico, desbridamiento y colocación de aloinjerto',
    postOpDay: 4,
    currentPlans: 'Oxacilina + Amikacina IV. Curación oclusiva con sulfadiazina de plata y apósito hidrocoloide. Analgesia con Morfina en bomba PCA asistida.',
    pendingPlans: 'Revisión en quirófano programada para pasado mañana para recambio de injerto biológico. Hemograma y PCR de control pendientes.',
    status: 'observacion',
    dietStatus: 'Dieta hiperproteica e hipercalórica pediátrica',
    avatarSticker: 'bear',
    bloodType: 'O+',
    allergies: 'Ninguna',
    vitals: { heartRate: 110, bloodPressure: '98/62', respiratoryRate: 24, oxygenSaturation: 97, temperature: 37.8 }
  },
  {
    id: 'pat-08',
    bedNumber: 8,
    firstName: 'Isabella',
    lastName: 'Rojas Vera',
    ageYears: 0,
    ageMonths: 6,
    gender: 'F',
    admissionDate: '2026-09-12', // 9 días (Crítica + Prolongada)
    primaryDiagnosis: 'Onfalocele roto / Peritonitis bacteriana',
    diagnoses: [
      'Defecto de pared abdominal - Onfalocele roto gigante',
      'Post-colocación de silo de Schuster con reducción progresiva',
      'Sepsis abdominal y falla ventilatoria aguda',
      'Disfunción orgánica múltiple en fase de estabilización'
    ],
    surgicalProcedure: 'Cierre de pared por etapas (Silo de Schuster)',
    postOpDay: 6,
    currentPlans: 'Meropenem + Vancomicina. Ventilación mecánica protectora en SIMV. Soporte inotrópico con Milrinona a dosis bajas. Sonda orogástrica a caída libre.',
    pendingPlans: 'Valoración quirúrgica urgente a las 16:00 para definir cierre fascial definitivo vs mantenimiento de silo. Gasometría arterial c/6h.',
    status: 'critico',
    dietStatus: 'Ayuno absoluto (NPT central)',
    avatarSticker: 'star',
    bloodType: 'AB+',
    allergies: 'Ninguna conocida',
    vitals: { heartRate: 155, bloodPressure: '75/42', respiratoryRate: 40, oxygenSaturation: 93, temperature: 38.4 }
  },
  // Cama 9: Libre
  {
    id: 'pat-10',
    bedNumber: 10,
    firstName: 'Emiliano',
    lastName: 'Cruz Delgado',
    ageYears: 10,
    ageMonths: 0,
    gender: 'M',
    admissionDate: '2026-09-19', // 2 días
    primaryDiagnosis: 'Hernia inguinal derecha incarcerada reducida',
    diagnoses: [
      'Hernia inguinal indirecta derecha incarcerada',
      'Post-hernioplastia con técnica de Ferguson pediátrica',
      'Edema escrotal leve reactivo'
    ],
    surgicalProcedure: 'Herniotomía y ligadura alta de saco herniario',
    postOpDay: 1,
    currentPlans: 'Paracetamol 500mg VO condicional a dolor. Cuidado local de herida quirúrgica con apósito estéril seco.',
    pendingPlans: 'Valoración médica a las 13:00 para retiro de venoclisis y firma de alta médica a domicilio.',
    status: 'estable',
    dietStatus: 'Dieta general pediátrica',
    avatarSticker: 'dino',
    bloodType: 'B+',
    allergies: 'Ninguna',
    vitals: { heartRate: 80, bloodPressure: '108/70', respiratoryRate: 18, oxygenSaturation: 99, temperature: 36.5 }
  },
  {
    id: 'pat-11',
    bedNumber: 11,
    firstName: 'Luciana',
    lastName: 'Flores Navarro',
    ageYears: 2,
    ageMonths: 3,
    gender: 'F',
    admissionDate: '2026-09-19', // 2 días
    primaryDiagnosis: 'Cuerpo extraño en esófago proximal (Moneda)',
    diagnoses: [
      'Ingestión accidental de cuerpo extraño esofágico',
      'Post-extracción endoscópica rígida bajo anestesia general',
      'Esofagitis focal no perforada grado I'
    ],
    surgicalProcedure: 'Esofagoscopía rígida + extracción de moneda de 1 sol',
    postOpDay: 1,
    currentPlans: 'Sucralfato jarabe pediátrico para protección mucosa. Dieta papilla líquida fría.',
    pendingPlans: 'Observación por 12 horas más para verificar ausencia de odinofagia o estridor. Alta médica tentativa esta tarde.',
    status: 'estable',
    dietStatus: 'Papilla blanda fría',
    avatarSticker: 'rabbit',
    bloodType: 'O+',
    allergies: 'Ninguna',
    vitals: { heartRate: 100, bloodPressure: '90/58', respiratoryRate: 22, oxygenSaturation: 99, temperature: 36.7 }
  },
  {
    id: 'pat-12',
    bedNumber: 12,
    firstName: 'Joaquín',
    lastName: 'Herrera Poma',
    ageYears: 12,
    ageMonths: 9,
    gender: 'M',
    admissionDate: '2026-09-15', // 6 días
    primaryDiagnosis: 'Apendicitis complicada / Absceso pélvico residual',
    diagnoses: [
      'Apendicitis gangrenosa perforada con peritonitis difusa de 4 cuadrantes',
      'Colección intraabdominal pélvica tabicada de 45cc',
      'Drenaje percutáneo guiado por ecografía Día 2'
    ],
    surgicalProcedure: 'Apendicectomía abierta previa + Drenaje percutáneo intervencionista',
    postOpDay: 5,
    currentPlans: 'Piperacilina/Tazobactam IV. Control de débito de dren pig-tail pélvico (50 ml purulento en 24h).',
    pendingPlans: 'Pendiente resultado de cultivo y antibiograma de secreción pélvica. Control tomográfico de abdomen programado para pasado mañana.',
    status: 'observacion',
    dietStatus: 'Dieta blanda astringente fraccionada',
    avatarSticker: 'lion',
    bloodType: 'A+',
    allergies: 'Sulfas',
    vitals: { heartRate: 94, bloodPressure: '112/72', respiratoryRate: 20, oxygenSaturation: 97, temperature: 37.5 }
  },
  // Cama 13: Libre
  {
    id: 'pat-14',
    bedNumber: 14,
    firstName: 'Martín',
    lastName: 'Paredes Luna',
    ageYears: 0,
    ageMonths: 9,
    gender: 'M',
    admissionDate: '2026-09-18', // 3 días
    primaryDiagnosis: 'Hipospadias distal + Corde incurvado',
    diagnoses: [
      'Hipospadias medio-distal congénito',
      'Post-uretroplastia tipo Snodgrass (TIP) + orquiopexia escrotal',
      'Sonda uretral tutorizada en derivación'
    ],
    surgicalProcedure: 'Uretroplastia de incisión de placa tubularizada (Snodgrass)',
    postOpDay: 2,
    currentPlans: 'Cefalexina profiláctica oral. Oxibutinina para espasmos vesicales. Curación compresiva peneana seca.',
    pendingPlans: 'Curación médica de vendaje peneano hoy a las 17:00. Mantener sonda de silicona hasta el 7mo día postquirúrgico.',
    status: 'estable',
    dietStatus: 'Lactancia y papillas normales',
    avatarSticker: 'rocket',
    bloodType: 'O-',
    allergies: 'Ninguna',
    vitals: { heartRate: 115, bloodPressure: '88/54', respiratoryRate: 26, oxygenSaturation: 99, temperature: 36.8 }
  },
  {
    id: 'pat-15',
    bedNumber: 15,
    firstName: 'Emma',
    lastName: 'Salgado Bravo',
    ageYears: 14,
    ageMonths: 2,
    gender: 'F',
    admissionDate: '2026-09-19', // 2 días
    primaryDiagnosis: 'Torsión de ovario derecho por quiste simple',
    diagnoses: [
      'Abdomen agudo ginecológico pediátrico',
      'Torsión anexial derecha de 3 vueltas',
      'Post-destorsión laparoscópica + quistectomía ovárica preservadora'
    ],
    surgicalProcedure: 'Laparoscopía diagnóstica y terapéutica + destorsión + ooforopexia',
    postOpDay: 1,
    currentPlans: 'Ketorolaco + Tramadol en rescate. Movilización temprana fuera de cama.',
    pendingPlans: 'Ecografía Doppler ginecológica transabdominal hoy para constatar flujo arterial ovárico restaurado.',
    status: 'estable',
    dietStatus: 'Dieta regular baja en grasas',
    avatarSticker: 'star',
    bloodType: 'B+',
    allergies: 'Aspirina',
    vitals: { heartRate: 76, bloodPressure: '115/75', respiratoryRate: 16, oxygenSaturation: 99, temperature: 36.6 }
  },
  {
    id: 'pat-16',
    bedNumber: 16,
    firstName: 'Dylan',
    lastName: 'Alarcón Gil',
    ageYears: 3,
    ageMonths: 7,
    gender: 'M',
    admissionDate: '2026-09-13', // 8 días (Estancia prolongada)
    primaryDiagnosis: 'Malformación anorrectal (Fístula rectoperineal)',
    diagnoses: [
      'Malformación anorrectal baja intervenida',
      'Post-anoplastia sagital posterior mínima (ASPM)',
      'Protocolo de dilataciones anales de Hegar en inicio'
    ],
    surgicalProcedure: 'Anoplastia sagital posterior mínima sin colostomía',
    postOpDay: 6,
    currentPlans: 'Aseo perineal estricto con solución salina post micción y defecación. Crema cicatrizante con óxido de zinc.',
    pendingPlans: 'Iniciar sesión educativa con los padres para dilatadores de Hegar #11. Control con cirujano pediátrico a las 15:30.',
    status: 'observacion',
    dietStatus: 'Dieta rica en fibra y ablandadores fecales',
    avatarSticker: 'dino',
    bloodType: 'O+',
    allergies: 'Ninguna',
    vitals: { heartRate: 98, bloodPressure: '96/60', respiratoryRate: 21, oxygenSaturation: 98, temperature: 36.9 }
  },
  {
    id: 'pat-17',
    bedNumber: 17,
    firstName: 'Gabriel',
    lastName: 'Zambrano Coello',
    ageYears: 6,
    ageMonths: 6,
    gender: 'M',
    admissionDate: '2026-09-18', // 3 días
    primaryDiagnosis: 'Hernia inguinal bilateral complicada con atascamiento',
    diagnoses: [
      'Hernia inguinal bilateral operada de urgencia',
      'Isquemia transitoria testicular izquierda resuelta al descomprimir',
      'Post-herniotomía bilateral abierta'
    ],
    surgicalProcedure: 'Hernioplastia bilateral por abordaje inguinal',
    postOpDay: 2,
    currentPlans: 'Paracetamol oral reglado. Apoyo escrotal y reposo en cama.',
    pendingPlans: 'Control clínico de viabilidad testicular por ecografía testicular Doppler a las 11:30. Alta médica probable mañana.',
    status: 'estable',
    dietStatus: 'Dieta normal',
    avatarSticker: 'bear',
    bloodType: 'A+',
    allergies: 'Ninguna',
    vitals: { heartRate: 85, bloodPressure: '102/65', respiratoryRate: 18, oxygenSaturation: 100, temperature: 36.7 }
  },
  // Cama 18: Libre
  {
    id: 'pat-19',
    bedNumber: 19,
    firstName: 'Samantha',
    lastName: 'Cordero Ponce',
    ageYears: 5,
    ageMonths: 0,
    gender: 'F',
    admissionDate: '2026-09-16', // 5 días
    primaryDiagnosis: 'Nefroblastoma (Tumor de Wilms) estadio II',
    diagnoses: [
      'Masa renal derecha palpable en estudio quirúrgico',
      'Post-nefrectomía radical derecha con muestreo ganglionar retroperitoneal',
      'Riesgo de sangrado postoperatorio en lecho renal'
    ],
    surgicalProcedure: 'Nefrectomía radical derecha + linfadenectomía',
    postOpDay: 3,
    currentPlans: 'Ceftriaxona IV. Drenaje tubular retroperitoneal (15 ml serohemático en 24h). Control de balance hídrico estricto y diuresis horaria.',
    pendingPlans: 'Pendiente informe de biopsia intraoperatoria definitiva por patología. Interconsulta con oncología pediátrica para quimioterapia adyuvante.',
    status: 'observacion',
    dietStatus: 'Dieta renal pediátrica normoproteica',
    avatarSticker: 'star',
    bloodType: 'O+',
    allergies: 'Latex (guantes y sondas)',
    vitals: { heartRate: 105, bloodPressure: '104/68', respiratoryRate: 22, oxygenSaturation: 98, temperature: 37.1 }
  }
  // Cama 20: Libre
];
