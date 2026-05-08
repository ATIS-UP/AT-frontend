import React, { useState } from 'react';
import { StudentList } from '../features/estudiantes/components/StudentList';
import { StudentProfileDrawer } from '../features/estudiantes/components/StudentProfileDrawer';

export default function EstudiantesPage() {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  return (
    <>
      <StudentList onSelectStudent={handleSelectStudent} />
      <StudentProfileDrawer 
        student={selectedStudent} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}