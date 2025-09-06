import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  Droplets,
  Timer,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const Reminders = () => {
  // Use one alarm ringtone (online)
  const alarmSound =
    "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg";

  // Alarm state
  const [alarmTime, setAlarmTime] = useState("");
  const [alarmSet, setAlarmSet] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);

  // Countdown timer state
  const [countdownTime, setCountdownTime] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState("30:00");

  // Water reminder state
  const [waterReminderActive, setWaterReminderActive] = useState(false);
  const [lastWaterNotification, setLastWaterNotification] = useState(null);

  // Refs
  const alarmIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const waterIntervalRef = useRef(null);

  // Request notifications
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Format time
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Play alarm sound
  const playSound = () => {
    try {
      const audio = new Audio(alarmSound);
      audio.play();
    } catch (error) {
      console.log("Sound play error:", error);
    }
  };

  // Show notification
  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  };

  // Alarm logic
  const handleSetAlarm = () => {
    if (!alarmTime) {
      toast.error("Please set an alarm time");
      return;
    }

    if (alarmActive) {
      clearTimeout(alarmIntervalRef.current);
      setAlarmActive(false);
      setAlarmSet(false);
      toast.success("Alarm cleared");
      return;
    }

    const now = new Date();
    const [hours, minutes] = alarmTime.split(":").map(Number);
    const alarmDate = new Date();
    alarmDate.setHours(hours, minutes, 0, 0);

    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1);
    }

    const timeUntilAlarm = alarmDate.getTime() - now.getTime();

    setAlarmSet(true);
    setAlarmActive(true);

    alarmIntervalRef.current = setTimeout(() => {
      playSound();
      showNotification("⏰ Workout Alarm!", "Time for your workout!");
      toast.success("⏰ Time for your workout!");
      setAlarmActive(false);
      setAlarmSet(false);
    }, timeUntilAlarm);

    toast.success(`Alarm set for ${alarmTime}`);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && countdownTime > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdownTime((prev) => {
          const newTime = prev - 1;
          setDisplayTime(formatTime(newTime));

          if (newTime === 0) {
            setIsRunning(false);
            playSound();
            showNotification("✅ Workout Complete!", "Great job!");
            toast.success("✅ Workout complete!");
            return 30 * 60;
          }
          return newTime;
        });
      }, 1000);
    } else {
      clearInterval(countdownIntervalRef.current);
    }

    return () => clearInterval(countdownIntervalRef.current);
  }, [isRunning, countdownTime]);

  const handleStartPause = () => setIsRunning(!isRunning);
  const handleReset = () => {
    setIsRunning(false);
    setCountdownTime(30 * 60);
    setDisplayTime("30:00");
  };

  const handleTimeChange = (minutes) => {
    const newTime = minutes * 60;
    setCountdownTime(newTime);
    setDisplayTime(formatTime(newTime));
    setIsRunning(false);
  };

  // Water reminder
  const handleToggleWaterReminder = () => {
    if (waterReminderActive) {
      clearInterval(waterIntervalRef.current);
      setWaterReminderActive(false);
      toast.success("Water reminder stopped");
    } else {
      setWaterReminderActive(true);
      setLastWaterNotification(new Date());
      playSound();
      showNotification("💧 Water Reminder", "Time to drink water!");
      toast.success("💧 Time to drink water!");

      waterIntervalRef.current = setInterval(() => {
        playSound();
        showNotification("💧 Water Reminder", "Time to drink water!");
        toast.success("💧 Time to drink water!");
        setLastWaterNotification(new Date());
      }, 2 * 60 * 60 * 1000);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      clearTimeout(alarmIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
      clearInterval(waterIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-primary-black p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Reminders & Timers</h1>
        <p className="text-text-gray mb-8">
          Stay on track with your fitness routine
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alarm */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Workout Alarm
            </h2>
            <input
              type="time"
              value={alarmTime}
              onChange={(e) => setAlarmTime(e.target.value)}
              className="input-field mb-4"
              disabled={alarmActive}
            />
            <button
              onClick={handleSetAlarm}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                alarmActive ? "bg-red-600" : "bg-accent-blue"
              } text-white`}
            >
              {alarmActive ? "Clear Alarm" : "Set Alarm"}
            </button>
            {alarmSet && (
              <p className="mt-2 text-accent-blue">
                ⏰ Alarm set for {alarmTime}
              </p>
            )}
          </div>

          {/* Timer */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Workout Timer
            </h2>
            <div className="text-5xl text-white text-center mb-4">
              {displayTime}
            </div>
            <div className="flex justify-center space-x-2 mb-4">
              {[15, 30, 45].map((m) => (
                <button
                  key={m}
                  onClick={() => handleTimeChange(m)}
                  className="btn-secondary"
                >
                  {m}m
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button onClick={handleStartPause} className="btn-primary flex-1">
                {isRunning ? "Pause" : "Start"}
              </button>
              <button onClick={handleReset} className="btn-secondary flex-1">
                Reset
              </button>
            </div>
          </div>

          {/* Water Reminder */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">
              Water Reminder
            </h2>
            <button
              onClick={handleToggleWaterReminder}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                waterReminderActive ? "bg-red-600" : "bg-blue-500"
              } text-white`}
            >
              {waterReminderActive ? "Stop Reminder" : "Start Reminder"}
            </button>
            {waterReminderActive && (
              <div className="mt-3">
                <p className="text-blue-400">
                  💧 Active - every 2 hours (last:{" "}
                  {lastWaterNotification?.toLocaleTimeString()})
                </p>

                {/* Hydration Tips */}
                <div className="p-3 bg-primary-dark-light rounded-lg mt-3">
                  <h4 className="text-white font-medium mb-2">
                    💡 Tips for Hydration:
                  </h4>
                  <ul className="text-text-gray text-sm space-y-1">
                    <li>• Drink 8-10 glasses of water daily</li>
                    <li>• Hydrate before, during, and after workouts</li>
                    <li>• Listen to your body's thirst signals</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mt-8 card">
          <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-accent-blue font-medium mb-2">🔔 Alarm</h4>
              <p className="text-text-gray text-sm">
                Set a specific time for your workout. The app will notify you
                with a sound and browser notification.
              </p>
            </div>
            <div>
              <h4 className="text-accent-green font-medium mb-2">⏱️ Timer</h4>
              <p className="text-text-gray text-sm">
                Use the countdown timer during your workout. Choose from 15, 30,
                or 45 minutes, or set a custom time.
              </p>
            </div>
            <div>
              <h4 className="text-blue-500 font-medium mb-2">💧 Water Reminder</h4>
              <p className="text-text-gray text-sm">
                Enable automatic water reminders every 2 hours to stay hydrated
                throughout the day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
