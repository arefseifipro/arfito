const APP_DATA = {
    lessons: [
        {
            id: "lesson-1",
            name: "ریاضی",
            icon: "math",
            weeks: [
                {
                    id: "w-1",
                    label: "هفته پانزدهم",
                    dateRange: "۲۳ مرداد الی ۳۱ مرداد",
                    parts: [
                        { id: "p-1", label: "پارت اول", day: "شنبه ۲۴ مرداد", done: true },
                        { id: "p-2", label: "پارت دوم", day: "یکشنبه ۲۵ مرداد", done: false },
                        { id: "p-3", label: "پارت سوم", day: "دوشنبه ۲۶ مرداد", done: false }
                    ]
                }
            ],
            resources: [
                {
                    id: "r-1",
                    title: "کتاب تست ریاضی جامع",
                    chapters: [
                        { id: "c-1", name: "فصل ۱: تابع", total: 50, done: 20 },
                        { id: "c-2", name: "فصل ۲: مثلثات", total: 40, done: 0 },
                        { id: "c-3", name: "فصل ۳: حد", total: 60, done: 10 }
                    ]
                }
            ]
        },
        {
            id: "lesson-2",
            name: "فیزیک",
            icon: "science",
            weeks: [],
            resources: [
                {
                    id: "r-2",
                    title: "کتاب تست فیزیک",
                    chapters: [
                        { id: "c-4", name: "فصل ۱: حرکت شناسی", total: 45, done: 15 }
                    ]
                }
            ]
        }
    ]
};

const ADMIN_CODE = "54667";
