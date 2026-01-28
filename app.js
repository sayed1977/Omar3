// تخزين البيانات في localStorage
const storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key) => {
        localStorage.removeItem(key);
    }
};

// بيانات التطبيق
let appData = {
    currentUser: null,
    currentRole: null,
    selectedSubject: null,
    selectedGrade: null,
    selectedClass: null,
    teachers: [
        { id: 1, username: 'ahmed', password: '123456', name: 'أحمد محمد', subject: 'رياضيات' },
        { id: 2, username: 'fatima', password: '123456', name: 'فاطمة علي', subject: 'فيزياء' },
        { id: 3, username: 'mohammed', password: '123456', name: 'محمد حسن', subject: 'كيمياء' },
        { id: 4, username: 'sara', password: '123456', name: 'سارة أحمد', subject: 'أحياء' },
        { id: 5, username: 'omar', password: '123456', name: 'عمر خالد', subject: 'لغة عربية' }
    ],
    admin: { username: 'admin', password: 'admin123' },
    students: {}
};

// تهيئة بيانات الطلاب
function initializeStudents() {
    const gradesConfig = {
        'الأول': ['1', '2', '3', '4', '5'],
        'الثاني': ['1', '2', '3']
    };
    
    Object.keys(gradesConfig).forEach(grade => {
        gradesConfig[grade].forEach(classNum => {
            const key = `${grade}-${classNum}`;
            appData.students[key] = [];
            
            for (let i = 1; i <= 30; i++) {
                appData.students[key].push({
                    id: i,
                    name: `طالب ${i}`,
                    grade: grade,
                    class: classNum
                });
            }
        });
    });
}

// تهيئة التطبيق
function initApp() {
    // تحميل البيانات المحفوظة
    const savedData = storage.get('schoolData');
    if (savedData) {
        appData = { ...appData, ...savedData };
    } else {
        initializeStudents();
        storage.set('schoolData', appData);
    }
    
    // التحقق من جلسة نشطة
    const session = storage.get('activeSession');
    if (session) {
        if (session.role === 'teacher') {
            showTeacherDashboard(session.user);
        } else if (session.role === 'admin') {
            showAdminDashboard();
        }
    }
}

// التبديل بين تبويبات تسجيل الدخول
function switchTab(tab) {
    const teacherTab = document.querySelector('.tab:first-child');
    const adminTab = document.querySelector('.tab:last-child');
    const teacherLogin = document.getElementById('teacherLogin');
    const adminLogin = document.getElementById('adminLogin');
    
    if (tab === 'teacher') {
        teacherTab.classList.add('active');
        adminTab.classList.remove('active');
        teacherLogin.classList.remove('hidden');
        adminLogin.classList.add('hidden');
    } else {
        adminTab.classList.add('active');
        teacherTab.classList.remove('active');
        adminLogin.classList.remove('hidden');
        teacherLogin.classList.add('hidden');
    }
}

// تسجيل دخول المعلم
function loginTeacher(event) {
    event.preventDefault();
    
    const username = document.getElementById('teacherUsername').value;
    const password = document.getElementById('teacherPassword').value;
    
    const teacher = appData.teachers.find(t => 
        t.username === username && t.password === password
    );
    
    if (teacher) {
        storage.set('activeSession', { role: 'teacher', user: teacher });
        showTeacherDashboard(teacher);
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// تسجيل دخول المدير
function loginAdmin(event) {
    event.preventDefault();
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === appData.admin.username && password === appData.admin.password) {
        storage.set('activeSession', { role: 'admin', user: appData.admin });
        showAdminDashboard();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// عرض لوحة المعلم
function showTeacherDashboard(teacher) {
    appData.currentUser = teacher;
    appData.currentRole = 'teacher';
    
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('teacherDashboard').classList.remove('hidden');
    document.getElementById('teacherName').textContent = teacher.name;
    
    // تعيين المادة تلقائياً
    document.getElementById('subjectSelect').value = teacher.subject;
}

// عرض لوحة المدير
function showAdminDashboard() {
    appData.currentRole = 'admin';
    
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    
    updateAdminStats();
    updateProgressLists();
}

// تسجيل الخروج
function logout() {
    storage.remove('activeSession');
    location.reload();
}

// تحديث الاختيار
function updateSelection() {
    const subject = document.getElementById('subjectSelect').value;
    if (subject) {
        appData.selectedSubject = subject;
    }
}

// تحديث خيارات الفصول بناءً على الصف المختار
function updateClassOptions() {
    const grade = document.getElementById('gradeSelect').value;
    const classSelect = document.getElementById('classSelect');
    
    if (!grade) {
        classSelect.innerHTML = '<option value="">اختر الفصل</option>';
        classSelect.disabled = true;
        return;
    }
    
    classSelect.disabled = false;
    classSelect.innerHTML = '<option value="">اختر الفصل</option>';
    
    const classCount = grade === 'الأول' ? 5 : 3;
    
    for (let i = 1; i <= classCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `الفصل ${i}`;
        classSelect.appendChild(option);
    }
}

// اختيار الصف
function selectGrade(grade) {
    if (!appData.selectedSubject) {
        alert('يرجى اختيار المادة أولاً');
        return;
    }
    
    appData.selectedGrade = grade;
    
    // عرض اختيار الفصل مع العدد المناسب
    document.getElementById('gradeSelect').value = grade;
    updateClassOptions();
}

// اختيار الفصل
function selectClass() {
    const subject = document.getElementById('subjectSelect').value;
    const grade = document.getElementById('gradeSelect').value;
    const classNum = document.getElementById('classSelect').value;
    
    if (!subject) {
        alert('يرجى اختيار المادة أولاً');
        return;
    }
    
    if (!grade) {
        alert('يرجى اختيار الصف أولاً');
        return;
    }
    
    if (!classNum) {
        alert('يرجى اختيار الفصل');
        return;
    }
    
    appData.selectedSubject = subject;
    appData.selectedGrade = grade;
    appData.selectedClass = classNum;
    
    // عرض صفحة رصد الدرجات
    showGradesEntry();
}

// عرض صفحة رصد الدرجات
function showGradesEntry() {
    document.getElementById('subjectSelection').classList.add('hidden');
    document.getElementById('gradesEntry').classList.remove('hidden');
    
    // تحديث معلومات الاختيار
    const selectionText = `${appData.selectedSubject} - الصف ${appData.selectedGrade} - الفصل ${appData.selectedClass}`;
    document.getElementById('currentSelection').textContent = selectionText;
    
    // تحميل قائمة الطلاب
    loadStudentsList();
}

// تحميل قائمة الطلاب
function loadStudentsList() {
    const key = `${appData.selectedGrade}-${appData.selectedClass}`;
    const students = appData.students[key] || [];
    
    const tbody = document.getElementById('gradesTableBody');
    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        // تحميل الدرجات المحفوظة
        const savedGrades = loadSavedGrades(student.id);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td style="text-align: right; font-weight: 600;">${student.name}</td>
            <td><input type="number" min="0" max="15" value="${savedGrades.evaluation}" data-student="${student.id}" data-type="evaluation" onchange="calculateTotal(this)"></td>
            <td><input type="number" min="0" max="15" value="${savedGrades.homeworkNotebook}" data-student="${student.id}" data-type="homeworkNotebook" onchange="calculateTotal(this)"></td>
            <td><input type="number" min="0" max="15" value="${savedGrades.exam1}" data-student="${student.id}" data-type="exam1" onchange="calculateTotal(this)"></td>
            <td><input type="number" min="0" max="15" value="${savedGrades.exam2}" data-student="${student.id}" data-type="exam2" onchange="calculateTotal(this)"></td>
            <td style="font-weight: 700; color: var(--primary);" id="total-${student.id}">${savedGrades.total}</td>
        `;
        tbody.appendChild(row);
    });
}

// تحميل الدرجات المحفوظة
function loadSavedGrades(studentId) {
    const gradesKey = `grades-${appData.selectedSubject}-${appData.selectedGrade}-${appData.selectedClass}-${studentId}`;
    const saved = storage.get(gradesKey);
    
    if (saved) {
        return saved;
    }
    
    return {
        evaluation: 0,
        homeworkNotebook: 0,
        exam1: 0,
        exam2: 0,
        total: 0
    };
}

// حساب المجموع
function calculateTotal(input) {
    const studentId = input.dataset.student;
    const row = input.closest('tr');
    const inputs = row.querySelectorAll('input[type="number"]');
    
    let total = 0;
    inputs.forEach(inp => {
        total += parseFloat(inp.value) || 0;
    });
    
    document.getElementById(`total-${studentId}`).textContent = total;
}

// حفظ الدرجات
function saveGrades() {
    const rows = document.querySelectorAll('#gradesTableBody tr');
    let savedCount = 0;
    
    rows.forEach(row => {
        const inputs = row.querySelectorAll('input[type="number"]');
        const studentId = inputs[0].dataset.student;
        
        const grades = {
            evaluation: parseFloat(inputs[0].value) || 0,
            homeworkNotebook: parseFloat(inputs[1].value) || 0,
            exam1: parseFloat(inputs[2].value) || 0,
            exam2: parseFloat(inputs[3].value) || 0,
            total: 0
        };
        
        grades.total = grades.evaluation + grades.homeworkNotebook + grades.exam1 + grades.exam2;
        
        const gradesKey = `grades-${appData.selectedSubject}-${appData.selectedGrade}-${appData.selectedClass}-${studentId}`;
        storage.set(gradesKey, grades);
        savedCount++;
    });
    
    // حفظ حالة الرصد
    const completionKey = `completion-${appData.currentUser.name}-${appData.selectedSubject}-${appData.selectedGrade}-${appData.selectedClass}`;
    storage.set(completionKey, {
        teacher: appData.currentUser.name,
        subject: appData.selectedSubject,
        grade: appData.selectedGrade,
        class: appData.selectedClass,
        date: new Date().toISOString(),
        status: 'completed'
    });
    
    // مزامنة مع Google Sheets
    syncToGoogleSheets();
    
    showAlert('success', `تم حفظ درجات ${savedCount} طالب بنجاح!`);
}

// عرض رسالة تنبيه
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    alertContainer.innerHTML = `
        <div class="alert ${alertClass}">
            ${message}
        </div>
    `;
    
    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// الرجوع إلى الاختيار
function backToSelection() {
    document.getElementById('gradesEntry').classList.add('hidden');
    document.getElementById('subjectSelection').classList.remove('hidden');
    
    appData.selectedSubject = null;
    appData.selectedGrade = null;
    appData.selectedClass = null;
}

// طباعة الدرجات
function printGrades() {
    // إنشاء صفحة طباعة
    const printWindow = window.open('', '', 'width=800,height=600');
    
    const content = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>طباعة الدرجات</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: 'Tajawal', Arial, sans-serif;
                    padding: 40px;
                    direction: rtl;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    border-bottom: 3px solid #1a5f7a;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #1a5f7a;
                    font-size: 24px;
                    margin-bottom: 10px;
                }
                .header h2 {
                    color: #159895;
                    font-size: 20px;
                    margin-bottom: 10px;
                }
                .header p {
                    font-size: 16px;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 30px 0;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 10px;
                    text-align: center;
                }
                th {
                    background-color: #1a5f7a;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f8f9fa;
                }
                .footer {
                    margin-top: 60px;
                    padding-top: 20px;
                    border-top: 2px solid #e0e0e0;
                }
                .signature {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                }
                .signature-block {
                    text-align: center;
                }
                .signature-block p {
                    margin-bottom: 50px;
                    font-weight: bold;
                }
                .signature-block .line {
                    border-top: 2px solid #000;
                    width: 200px;
                    display: inline-block;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>إدارة ناصر التعليمية</h1>
                <h2>مدرسة عمر بن الخطاب الثانوية</h2>
                <p><strong>درجات مادة: ${appData.selectedSubject}</strong></p>
                <p>الصف ${appData.selectedGrade} الثانوي - الفصل ${appData.selectedClass}</p>
                <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
            
            ${document.querySelector('.grades-table-wrapper').innerHTML}
            
            <div class="footer">
                <div class="signature">
                    <div class="signature-block">
                        <p>توقيع المعلم</p>
                        <div class="line"></div>
                        <p>${appData.currentUser.name}</p>
                    </div>
                    <div class="signature-block">
                        <p>تنفيذ / أ. سيد مصطفى</p>
                        <div class="line"></div>
                    </div>
                    <div class="signature-block">
                        <p>توقيع المدير</p>
                        <div class="line"></div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
    
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// تحديث إحصائيات المدير
function updateAdminStats() {
    const totalTeachers = appData.teachers.length;
    let completedCount = 0;
    let totalPossible = 0;
    
    // حساب عدد المواد المرصودة
    const gradesConfig = {
        'الأول': ['1', '2', '3', '4', '5'],
        'الثاني': ['1', '2', '3']
    };
    
    appData.teachers.forEach(teacher => {
        Object.keys(gradesConfig).forEach(grade => {
            gradesConfig[grade].forEach(classNum => {
                totalPossible++;
                const completionKey = `completion-${teacher.name}-${teacher.subject}-${grade}-${classNum}`;
                if (storage.get(completionKey)) {
                    completedCount++;
                }
            });
        });
    });
    
    const pendingCount = totalPossible - completedCount;
    const completionRate = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0;
    
    document.getElementById('totalTeachers').textContent = totalTeachers;
    document.getElementById('completedSubjects').textContent = completedCount;
    document.getElementById('pendingSubjects').textContent = pendingCount;
    document.getElementById('completionRate').textContent = completionRate + '%';
}

// تحديث قوائم التقدم
function updateProgressLists() {
    updateProgressListForGrade('الأول', 'grade1Progress');
    updateProgressListForGrade('الثاني', 'grade2Progress');
}

function updateProgressListForGrade(grade, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    const classCount = grade === 'الأول' ? 5 : 3;
    const classes = Array.from({length: classCount}, (_, i) => String(i + 1));
    
    appData.teachers.forEach(teacher => {
        classes.forEach(classNum => {
            const completionKey = `completion-${teacher.name}-${teacher.subject}-${grade}-${classNum}`;
            const completion = storage.get(completionKey);
            
            const item = document.createElement('div');
            item.className = 'progress-item';
            
            const status = completion ? 'completed' : 'pending';
            const statusText = completion ? 'مكتمل' : 'غير مكتمل';
            const badgeClass = completion ? 'completed' : 'pending';
            
            item.innerHTML = `
                <div>
                    <strong>${teacher.name}</strong> - ${teacher.subject} - الفصل ${classNum}
                </div>
                <span class="progress-badge ${badgeClass}">${statusText}</span>
            `;
            
            container.appendChild(item);
        });
    });
}

// تصدير البيانات إلى Excel
function exportExcel(subjectName) {
    // التحقق من وجود مكتبة SheetJS
    if (typeof XLSX === 'undefined') {
        alert('جاري تحميل مكتبة التصدير...');
        loadSheetJS(() => exportExcel(subjectName));
        return;
    }
    
    if (!subjectName) {
        alert('يرجى اختيار المادة للتصدير');
        return;
    }
    
    const data = collectGradesForSubject(subjectName);
    
    if (data.length === 0) {
        alert('لا توجد بيانات للتصدير لمادة ' + subjectName);
        return;
    }
    
    // إنشاء workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // تنسيق العرض
    const colWidths = [
        {wch: 20}, // اسم الطالب
        {wch: 15}, // الصف
        {wch: 10}, // الفصل
        {wch: 15}, // التقييم
        {wch: 20}, // الواجب والكشكول
        {wch: 15}, // الاختبار الأول
        {wch: 15}, // الاختبار الثاني
        {wch: 15}  // المجموع
    ];
    ws['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(wb, ws, subjectName);
    
    const filename = `${subjectName}_grades.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showAlert('success', `تم تصدير درجات مادة ${subjectName} بنجاح!`);
}

// جمع البيانات لمادة معينة
function collectGradesForSubject(subjectName) {
    const data = [];
    const gradesConfig = {
        'الأول': ['1', '2', '3', '4', '5'],
        'الثاني': ['1', '2', '3']
    };
    
    Object.keys(gradesConfig).forEach(grade => {
        gradesConfig[grade].forEach(classNum => {
            const key = `${grade}-${classNum}`;
            const students = appData.students[key] || [];
            
            students.forEach(student => {
                const gradesKey = `grades-${subjectName}-${grade}-${classNum}-${student.id}`;
                const grades = storage.get(gradesKey);
                
                if (grades) {
                    data.push({
                        'اسم الطالب': student.name,
                        'الصف': `الصف ${grade}`,
                        'الفصل': classNum,
                        'التقييم (15)': grades.evaluation,
                        'الواجب والكشكول (15)': grades.homeworkNotebook,
                        'الاختبار الأول (15)': grades.exam1,
                        'الاختبار الثاني (15)': grades.exam2,
                        'المجموع (60)': grades.total
                    });
                }
            });
        });
    });
    
    return data;
}

// تحميل مكتبة SheetJS
function loadSheetJS(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    script.onload = callback;
    document.head.appendChild(script);
}

// عرض نافذة استيراد البيانات
function showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            alert('تم اختيار الملف: ' + file.name + '\n\nسيتم استيراد البيانات. هذه الميزة تتطلب مكتبة خارجية مثل SheetJS في التطبيق الفعلي.');
        }
    };
    input.click();
}

// ========== Google Sheets Sync ==========

// إعدادات Google Sheets
const GOOGLE_SHEETS_CONFIG = {
    apiKey: '', // سيتم إدخالها من المستخدم
    spreadsheetId: '', // سيتم إدخالها من المستخدم
    enabled: false
};

// تحميل إعدادات Google Sheets من التخزين
function loadGoogleSheetsConfig() {
    const config = storage.get('googleSheetsConfig');
    if (config) {
        Object.assign(GOOGLE_SHEETS_CONFIG, config);
    }
}

// حفظ إعدادات Google Sheets
function saveGoogleSheetsConfig(apiKey, spreadsheetId) {
    GOOGLE_SHEETS_CONFIG.apiKey = apiKey;
    GOOGLE_SHEETS_CONFIG.spreadsheetId = spreadsheetId;
    GOOGLE_SHEETS_CONFIG.enabled = !!(apiKey && spreadsheetId);
    storage.set('googleSheetsConfig', GOOGLE_SHEETS_CONFIG);
    showAlert('success', 'تم حفظ إعدادات Google Sheets بنجاح!');
}

// فتح نافذة إعدادات Google Sheets
function openGoogleSheetsSettings() {
    loadGoogleSheetsConfig();
    
    const apiKey = prompt('أدخل Google API Key:', GOOGLE_SHEETS_CONFIG.apiKey || '');
    if (!apiKey) return;
    
    const spreadsheetId = prompt('أدخل Spreadsheet ID:', GOOGLE_SHEETS_CONFIG.spreadsheetId || '');
    if (!spreadsheetId) return;
    
    saveGoogleSheetsConfig(apiKey, spreadsheetId);
}

// مزامنة البيانات مع Google Sheets
async function syncToGoogleSheets() {
    loadGoogleSheetsConfig();
    
    if (!GOOGLE_SHEETS_CONFIG.enabled) {
        console.log('Google Sheets sync is disabled');
        return;
    }
    
    try {
        // جمع جميع البيانات
        const allData = collectAllGradesData();
        
        // تحديث Google Sheets
        await updateGoogleSheet(allData);
        
        console.log('تمت المزامنة مع Google Sheets بنجاح');
    } catch (error) {
        console.error('خطأ في المزامنة مع Google Sheets:', error);
    }
}

// جمع جميع البيانات للمزامنة
function collectAllGradesData() {
    const data = [];
    const gradesConfig = {
        'الأول': ['1', '2', '3', '4', '5'],
        'الثاني': ['1', '2', '3']
    };
    
    appData.teachers.forEach(teacher => {
        Object.keys(gradesConfig).forEach(grade => {
            gradesConfig[grade].forEach(classNum => {
                const key = `${grade}-${classNum}`;
                const students = appData.students[key] || [];
                
                students.forEach(student => {
                    const gradesKey = `grades-${teacher.subject}-${grade}-${classNum}-${student.id}`;
                    const grades = storage.get(gradesKey);
                    
                    if (grades) {
                        data.push({
                            subject: teacher.subject,
                            grade: grade,
                            class: classNum,
                            studentName: student.name,
                            evaluation: grades.evaluation,
                            homeworkNotebook: grades.homeworkNotebook,
                            exam1: grades.exam1,
                            exam2: grades.exam2,
                            total: grades.total,
                            lastUpdate: new Date().toISOString()
                        });
                    }
                });
            });
        });
    });
    
    return data;
}

// تحديث Google Sheet
async function updateGoogleSheet(data) {
    const { apiKey, spreadsheetId } = GOOGLE_SHEETS_CONFIG;
    
    // تحويل البيانات إلى صيغة Google Sheets
    const values = [
        ['المادة', 'الصف', 'الفصل', 'اسم الطالب', 'التقييم (15)', 'الواجب والكشكول (15)', 'اختبار 1 (15)', 'اختبار 2 (15)', 'المجموع (60)', 'آخر تحديث']
    ];
    
    data.forEach(item => {
        values.push([
            item.subject,
            item.grade,
            item.class,
            item.studentName,
            item.evaluation,
            item.homeworkNotebook,
            item.exam1,
            item.exam2,
            item.total,
            item.lastUpdate
        ]);
    });
    
    const range = 'Sheet1!A1';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear?key=${apiKey}`;
    
    // مسح البيانات القديمة
    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });
    
    // إضافة البيانات الجديدة
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`;
    
    await fetch(updateUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            values: values
        })
    });
}

// استيراد البيانات من Google Sheets
async function importFromGoogleSheets() {
    loadGoogleSheetsConfig();
    
    if (!GOOGLE_SHEETS_CONFIG.enabled) {
        alert('يرجى تكوين إعدادات Google Sheets أولاً');
        openGoogleSheetsSettings();
        return;
    }
    
    try {
        const { apiKey, spreadsheetId } = GOOGLE_SHEETS_CONFIG;
        const range = 'Sheet1!A2:J'; // تخطي صف العناوين
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.values && result.values.length > 0) {
            // معالجة البيانات المستوردة
            result.values.forEach(row => {
                const [subject, grade, classNum, studentName, evaluation, homeworkNotebook, exam1, exam2, total] = row;
                
                // البحث عن الطالب
                const key = `${grade}-${classNum}`;
                const students = appData.students[key] || [];
                const student = students.find(s => s.name === studentName);
                
                if (student) {
                    const gradesKey = `grades-${subject}-${grade}-${classNum}-${student.id}`;
                    storage.set(gradesKey, {
                        evaluation: parseFloat(evaluation) || 0,
                        homeworkNotebook: parseFloat(homeworkNotebook) || 0,
                        exam1: parseFloat(exam1) || 0,
                        exam2: parseFloat(exam2) || 0,
                        total: parseFloat(total) || 0
                    });
                }
            });
            
            showAlert('success', 'تم استيراد البيانات من Google Sheets بنجاح!');
            location.reload();
        }
    } catch (error) {
        showAlert('error', 'خطأ في استيراد البيانات: ' + error.message);
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
