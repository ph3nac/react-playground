import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const TaskItem = ({ task, index, moveTask }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropTop] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      if (item.id !== task.id) {
        moveTask(item.id, task.start);
      }
    },
  });

  const [, dropBottom] = useDrop({
    accept: 'TASK',
    hover(item, monitor) {
      if (item.id !== task.id) {
        moveTask(item.id, task.start + task.duration);
      }
    },
  });

  return (
    <div
      ref={drag}
      className={`absolute left-12 right-0 p-2 ${task.color} text-white rounded cursor-move`}
      style={{
        top: `${task.start * 3}rem`,
        height: `${task.duration * 3}rem`,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div ref={dropTop} className="h-2 w-full absolute top-0 left-0" />
      {task.name}
      <div ref={dropBottom} className="h-2 w-full absolute bottom-0 left-0" />
    </div>
  );
};

const TimelineView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([
    { id: 1, name: "Meeting", start: 9, duration: 2, color: "bg-blue-500" },
    { id: 2, name: "Coding", start: 13, duration: 3, color: "bg-green-500" },
    { id: 3, name: "Break", start: 16, duration: 1, color: "bg-yellow-500" },
  ]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", start: 0, duration: 1, color: "bg-purple-500" });

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const colors = ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500", "bg-pink-500"];

  const formatDate = (date) => {
    return date.toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleTimelineClick = (hour) => {
    if (!isAddingTask) {
      setIsAddingTask(true);
      setNewTask({ ...newTask, start: hour });
    }
  };

  const handleAddTask = () => {
    if (newTask.name) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setIsAddingTask(false);
      setNewTask({ name: "", start: 0, duration: 1, color: "bg-purple-500" });
    }
  };

  const handleCancelAdd = () => {
    setIsAddingTask(false);
    setNewTask({ name: "", start: 0, duration: 1, color: "bg-purple-500" });
  };

  const moveTask = useCallback((id, newStart) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? { ...task, start: Math.max(0, Math.min(23, newStart)) }
          : task
      )
    );
  }, []);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="btn btn-circle" onClick={() => changeDate(-1)}>
            <ChevronLeft />
          </button>
          <h2 className="text-xl font-bold">{formatDate(currentDate)}</h2>
          <button className="btn btn-circle" onClick={() => changeDate(1)}>
            <ChevronRight />
          </button>
        </div>
        <div className="relative">
          {timeSlots.map((hour) => (
            <div key={hour} className="flex items-center h-12 border-t" onClick={() => handleTimelineClick(hour)}>
              <span className="w-12 text-right pr-2 text-sm">{`${hour}:00`}</span>
              <div className="flex-grow h-full relative"></div>
            </div>
          ))}
          {tasks.map((task, index) => (
            <TaskItem key={task.id} task={task} index={index} moveTask={moveTask} />
          ))}
        </div>
        {isAddingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">新しいタスクを追加</h3>
              <input
                type="text"
                placeholder="タスク名"
                className="input input-bordered w-full mb-2"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
              />
              <div className="flex mb-2">
                <input
                  type="number"
                  placeholder="開始時間"
                  className="input input-bordered w-1/2 mr-2"
                  value={newTask.start}
                  onChange={(e) => setNewTask({ ...newTask, start: parseInt(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="期間（時間）"
                  className="input input-bordered w-1/2"
                  value={newTask.duration}
                  onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex mb-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full mr-2 cursor-pointer ${color}`}
                    onClick={() => setNewTask({ ...newTask, color })}
                  ></div>
                ))}
              </div>
              <div className="flex justify-end">
                <button className="btn btn-primary mr-2" onClick={handleAddTask}>追加</button>
                <button className="btn" onClick={handleCancelAdd}>キャンセル</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default TimelineView;
