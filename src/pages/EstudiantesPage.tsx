import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
      <Helmet>
        <title>SATISUP - Estudiantes</title>
        <meta name="description" content="Gestión de estudiantes del programa de Ingeniería de Sistemas - Universidad de Pamplona." />
      </Helmet>
      <StudentList onSelectStudent={handleSelectStudent} />
      <StudentProfileDrawer 
        student={selectedStudent} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}