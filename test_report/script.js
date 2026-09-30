document.addEventListener('DOMContentLoaded', () => {
    const addPartBtn = document.getElementById('add-part-btn');
    const partsContainer = document.getElementById('parts-container');
    const printBtn = document.getElementById('print-btn');
    const reportBtn = document.getElementById('report-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const lessonTitleInput = document.getElementById('lessonTitle');
    const reportOutput = document.getElementById('report-output');

    let partCount = 0;

    // تابع اضافه کردن فرم پارت جدید
    function addPartForm() {
        partCount++;
        const partDiv = document.createElement('div');
        partDiv.classList.add('part-form');
        partDiv.setAttribute('data-part-id', partCount);

        partDiv.innerHTML = `
            <div class="part-header">
                <span>پارت ${partCount}</span>
                <button type="button" class="delete-part-btn"><i class="ri-delete-bin-line"></i> حذف</button>
            </div>
            <div class="input-group">
            
                <label for="date-${partCount}">تاریخ:</label>
                <input type="date" id="date-${partCount}" name="date" required>
            </div>
            <div class="input-group">
                <label for="day-${partCount}">روز:</label>
                <select id="day-${partCount}" name="day" required>
                    <option value="">انتخاب روز</option>
                    <option value="شنبه">شنبه</option>
                    <option value="یک‌شنبه">یک‌شنبه</option>
                    <option value="دوشنبه">دوشنبه</option>
                    <option value="سه‌شنبه">سه‌شنبه</option>
                    <option value="چهارشنبه">چهارشنبه</option>
                    <option value="پنج‌شنبه">پنج‌شنبه</option>
                    <option value="جمعه">جمعه</option>
                </select>
            </div>
            <div class="row">
            <div class="input-group">
                <label for="season-${partCount}">فصل:</label>
                <input type="text" id="season-${partCount}" name="season" placeholder="مثال: اول" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="mission-${partCount}">گام:</label>
                <input type="text" id="mission-${partCount}" name="mission" placeholder="مثال: اول" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="total-tests-${partCount}">تعداد کل تست:</label>
                <input type="number" id="total-tests-${partCount}" name="totalTests" min="0" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="percentage-${partCount}">درصد:</label>
                <input type="number" id="percentage-${partCount}" name="percentage" min="0" max="100" step="0.1" placeholder="مثال: 85.5" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="correct-${partCount}">تعداد درست:</label>
                <input type="number" id="correct-${partCount}" name="correct" min="0" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="incorrect-${partCount}">تعداد غلط:</label>
                <input type="number" id="incorrect-${partCount}" name="incorrect" min="0" required>
            </div></div>
            <div class="row">
            <div class="input-group">
                <label for="unattempted-${partCount}">تعداد نزده:</label>
                <input type="number" id="unattempted-${partCount}" name="unattempted" min="0" required>
            </div>
            </div>
        `;

        partsContainer.appendChild(partDiv);

        // اضافه کردن event listener برای دکمه حذف
        partDiv.querySelector('.delete-part-btn').addEventListener('click', () => {
            partDiv.remove();
            // در صورت نیاز، شمارنده پارت‌ها را به‌روزرسانی کنید یا نام‌گذاری مجدد انجام دهید
            // برای سادگی فعلا این کار انجام نشده است
             updatePartHeaders(); // به‌روزرسانی سربرگ پارت‌ها پس از حذف
        });
    }

    // تابع به‌روزرسانی سربرگ پارت‌ها پس از حذف
    function updatePartHeaders() {
        const partForms = partsContainer.querySelectorAll('.part-form');
        let currentPartNum = 1;
        partForms.forEach(partForm => {
            const headerSpan = partForm.querySelector('.part-header span');
            headerSpan.textContent = `پارت ${currentPartNum}`;
            partForm.setAttribute('data-part-id', currentPartNum); // به‌روزرسانی ID برای ارجاعات بعدی
            currentPartNum++;
        });
        partCount = currentPartNum - 1; // تنظیم مجدد شمارنده کلی
    }


    // تابع تولید گزارش نهایی
    function generateReport() {
        const lessonTitle = lessonTitleInput.value || 'گزارش';
        const partForms = partsContainer.querySelectorAll('.part-form');
        let reportHtml = `<h3>${lessonTitle} - مجموع پارت‌ها: ${partForms.length}</h3>`;

        if (partForms.length === 0) {
            reportHtml += '<p>هیچ پارتی برای نمایش وجود ندارد.</p>';
            reportOutput.innerHTML = reportHtml;
            return;
        }

        // محاسبه تعداد ستون‌ها برای صفحه A4 افقی
        // برای A4 landscape حدود 297mm عرض داریم، با حاشیه 1cm از طرفین، حدود 277mm داریم.
        // اگر هر پارت 50% عرض را بگیرد، دو ستون خواهیم داشت.
        // اگر نیاز به تعداد ستون متغیر دارید، منطق پیچیده‌تری لازم است.
        // در حال حاضر فرض بر این است که در حالت پرینت، هر پارت یا نصف صفحه (دو ستونه) یا کل صفحه (یک ستونه) را اشغال می‌کند.
        // برای سادگی، در اینجا مدل پرینت را طوری تنظیم می‌کنیم که اگر تعداد پارت‌ها زیاد باشد، سعی کند آن‌ها را پخش کند.

        partForms.forEach((partForm, index) => {
            const partId = partForm.getAttribute('data-part-id');
            const date = partForm.querySelector(`#date-${partId}`).value;
            const day = partForm.querySelector(`#day-${partId}`).value;
            const season = partForm.querySelector(`#season-${partId}`).value;
            const mission = partForm.querySelector(`#mission-${partId}`).value;
            const totalTests = partForm.querySelector(`#total-tests-${partId}`).value;
            const percentage = partForm.querySelector(`#percentage-${partId}`).value;
            const correct = partForm.querySelector(`#correct-${partId}`).value;
            const incorrect = partForm.querySelector(`#incorrect-${partId}`).value;
            const unattempted = partForm.querySelector(`#unattempted-${partId}`).value;

            reportHtml += `
                <div class="part-section">
                    
                    <div class="part-details">
                        <div class="detail-item"><i class="ri-stack-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
<path d="m261-526 220-354 220 354H261ZM706-80q-74 0-124-50t-50-124q0-74 50-124t124-50q74 0 124 50t50 124q0 74-50 124T706-80Zm-586-25v-304h304v304H120Zm586.08-35Q754-140 787-173.08q33-33.09 33-81Q820-302 786.92-335q-33.09-33-81-33Q658-368 625-334.92q-33 33.09-33 81Q592-206 625.08-173q33.09 33 81 33ZM180-165h184v-184H180v184Zm189-421h224L481-767 369-586Zm112 0ZM364-349Zm342 95Z"/>
</svg><strong>پارت</strong>${partId}</div>
                        <div class="detail-item"><i class="ri-stack-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-60h65v60h340v-60h65v60h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Zm100 210v-60h400v60H280Zm0 180v-60h279v60H280Z"></path>
                        </svg><strong>گام:</strong>${mission}</div>
                        <div class="detail-item"><i class="ri-calendar-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-60h65v60h340v-60h65v60h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm0-490h600v-130H180v130Zm0 0v-130 130Zm100 210v-60h400v60H280Zm0 180v-60h279v60H280Z"></path>
                        </svg><strong>تاریخ:</strong> ${date ? new Date(date).toLocaleDateString('fa-IR') : '-'}</div>
                        <div class="detail-item"><i class="ri-sun-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8"><path d="M370-287h360v-90H370v90ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm0-600v600-600Z"/></svg><strong>روز:</strong> ${day || '-'}</div>
                        <div class="detail-item"><i class="ri-stack-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="M480-80q-27 0-47.5-13T406-129h-14q-24 0-42-18t-18-42v-143q-66-43-104-110t-38-148q0-121 84.5-205.5T480-880q121 0 205.5 84.5T770-590q0 81-38 148T628-332v143q0 24-18 42t-42 18h-14q-6 23-26.5 36T480-80Zm-88-109h176v-44H392v44Zm0-84h176v-40H392v40Zm-9-100h74v-137l-92-92 31-31 84 84 84-84 31 31-92 92v137h74q60-28 96.5-87T710-590q0-97-66.5-163.5T480-820q-97 0-163.5 66.5T250-590q0 71 36.5 130t96.5 87Zm97-176Zm0-48Z"/>
                        </svg><strong>فصل:</strong> ${season || '-'}</div>
                        <div class="detail-item"><i class="ri-question-mark"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.88" height="12.8"><path d="M80-80v-224h224v224H80Zm288 0v-224h224v224H368Zm288 0v-224h224v224H656ZM80-368v-224h224v224H80Zm288 0v-224h224v224H368Zm288 0v-224h224v224H656ZM80-656v-224h800v224H80Zm164 412Zm184 0h104-104Zm288 0ZM244-428v-104 104Zm236-52Zm236 52v-104 104ZM140-140h104v-104H140v104Zm288 0h104v-104H428v104Zm288 0h104v-104H716v104ZM140-428h104v-104H140v104Zm288 0h104v-104H428v104Zm288 0h104v-104H716v104Z"></path></svg><strong>کل تست:</strong> ${totalTests || '-'}</div>
                        <div class="detail-item"><i class="ri-percentage-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="m576-160-42-42 111-111-111-111 42-42 111 111 111-111 42 42-111 111 111 111-42 42-111-111-111 111Zm83-374L517-676l42-42 100 99 179-179 42 43-221 221ZM80-290v-60h360v60H80Zm0-320v-60h360v60H80Z"></path>
                        </svg><strong>درصد:</strong> ${percentage ? `${percentage}%` : '-'}</div>
                        <div class="detail-item"><i class="ri-checkbox-circle-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="M351-120q-97 0-164-67t-67-164v-258q0-97 67-164t164-67h258q97 0 164 67t67 164v258q0 97-67 164t-164 67H351Zm88-205 240-240-43-43-197 197-97-97-43 43 140 140Zm-88 145h258q71 0 121-50t50-121v-258q0-71-50-121t-121-50H351q-71 0-121 50t-50 121v258q0 71 50 121t121 50Zm129-300Z"/>
                        </svg><strong>صحیح:</strong> ${correct || '-'}</div>
                        <div class="detail-item"><i class="ri-close-circle-line"></i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8">
                        <path d="M330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm27-195 123-123 123 123 42-42-123-123 123-123-42-42-123 123-123-123-42 42 123 123-123 123 42 42Zm-2 135h250l175-175v-250L605-780H355L180-605v250l175 175Zm125-300Z"/>
                        </svg><strong>غلط:</strong> ${incorrect || '-'}</div>
                        <div class="detail-item"><i class="ri-slash-dot-line"></i><svg class="detail-item" xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#000000" style="" width="12.8" height="12.8"><path d="M453-280h60v-406h-60v406Zm27 200q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z"></path></svg><strong>نزده:</strong> ${unattempted || '-'}</div>
                    </div>
                </div>
            `;
        });

        reportOutput.innerHTML = reportHtml;
    }

    // اضافه کردن event listener برای دکمه افزودن پارت
    addPartBtn.addEventListener('click', addPartForm);



printBtn.addEventListener('click', () => {
    generateReport();
    window.print();
});

reportBtn.addEventListener('click', () => {
    generateReport(); // ابتدا گزارش را تولید می‌کنیم
});
reportBtn.addEventListener('click', () => {
    generateReport(); // ابتدا گزارش را تولید می‌کنیم
});
function downloadPDF() {
    const reportElement = document.getElementById('report-output');
    const lessonTitleInput = document.getElementById('lessonTitle'); // ورودی اسم درس
    
    // چک کن که گزارش خالی نباشه
    if (!reportElement || !reportElement.innerHTML.trim()) {
        alert('لطفاً ابتدا گزارش را تولید کنید.');
        return;
    }

    // گرفتن اسم درس و تمیز کردنش (حذف فاصله‌های اضافی)
    let titleVal = lessonTitleInput ? lessonTitleInput.value.trim() : '';
    
    // اگر اسم درس خالی بود، یک اسم پیش‌فرض می‌ذاریم
    if (!titleVal) {
        titleVal = 'گزارش_درس';
    }

    // ساختن اسم فایل نهایی با پسوند pdf
    const fileName = `${titleVal}.pdf`;

    // تنظیمات کیفیت بالا (scale 3 برای وضوح عالی)
    const options = {
        scale: 3,
        useCORS: true,
        logging: false
    };

    // گرفتن عکس از صفحه
    html2canvas(reportElement, options).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // ساخت PDF با استفاده از jsPDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // محاسبه ابعاد برای پر کردن صفحه A4
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // اضافه کردن عکس به PDF
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        
        // ذخیره فایل با اسم درس
        pdf.save(fileName);
    });
}



// اتصال دکمه به تابع
pdfBtn.addEventListener('click', downloadPDF);

    // فعال کردن اولین پارت به صورت پیش‌فرض
    addPartForm();
})