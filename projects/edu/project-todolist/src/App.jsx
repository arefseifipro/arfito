import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="p-4 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold">مدیریت پروژه شخصی</h1>
          <ThemeToggle />
        </header>

        <main className="p-6 space-y-10">
          <section>
            <h2 className="text-2xl mb-2 font-semibold">اهداف کلان</h2>
            {/* TODO: لیست اهداف */}
            <p className="text-sm opacity-60">در اینجا اهداف کلان نمایش داده می‌شوند.</p>
          </section>

          <section>
            <h2 className="text-2xl mb-2 font-semibold">برنامه‌های هفتگی</h2>
            {/* TODO: لیست برنامه‌های هفتگی */}
            <p className="text-sm opacity-60">برنامه‌های هفتگی اینجا قرار می‌گیرند.</p>
          </section>

          <section>
            <h2 className="text-2xl mb-2 font-semibold">وظایف روزانه</h2>
            {/* TODO: لیست وظایف روزانه */}
            <p className="text-sm opacity-60">وظایف روزانه اینجا نمایش داده می‌شوند.</p>
          </section>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
