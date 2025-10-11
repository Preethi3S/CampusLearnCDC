import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import progressApi from '../../api/progressApi';
import ModuleCard from '../../components/ModuleCard';
import CodingLinks from '../../components/CodingLinks'; // <-- import here

export default function CourseView() {
  const { id } = useParams(); // courseId
  const token = useSelector(s => s.auth.token);
  const [progress, setProgress] = useState(null);

  const fetchProgress = async () => {
    const data = await progressApi.getCourseProgress(id, token);
    setProgress(data);
  };

  const completeModule = async (levelId, moduleId) => {
    await progressApi.completeModule(id, levelId, moduleId, token);
    fetchProgress();
  };

  useEffect(() => { fetchProgress(); }, [id]);

  if (!progress) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{progress.course.title}</h2>

      {progress.levels.map(level => {
        const courseLevel = progress.course.levels.find(l => l._id === level.levelId);
        return (
          <div key={level.levelId} style={{ marginBottom: 16 }}>
            <h3>{courseLevel?.title}</h3>

            {level.modules.map((mod, index) => {
              const moduleData = courseLevel?.modules.find(m => m._id === mod.moduleId);
              const completed = mod.completed;
              const locked = index > 0 && !level.modules[index - 1].completed;

              return (
                <div key={mod.moduleId} style={{ marginBottom: 12 }}>
                  {/* Resource / Quiz modules */}
                  {moduleData.type !== 'coding' && (
                    <ModuleCard
                      module={moduleData}
                      completed={completed}
                      locked={locked}
                      onComplete={() => completeModule(level.levelId, mod.moduleId)}
                    />
                  )}

                  {/* Coding module */}
                  {moduleData.type === 'coding' && !locked && (
                    <CodingLinks
                      courseId={id}
                      levelId={level.levelId}
                      moduleId={mod.moduleId}
                    />
                  )}

                  {/* Locked module notice */}
                  {locked && <p style={{ color: 'gray' }}>This module is locked until previous module is completed.</p>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
