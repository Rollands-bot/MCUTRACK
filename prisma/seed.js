import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      email: 'admin@hospital.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log('✅ Created Admin user')

  // Create Nurse User
  const nurse = await prisma.user.upsert({
    where: { email: 'nurse@hospital.com' },
    update: {},
    create: {
      email: 'nurse@hospital.com',
      password: hashedPassword,
      name: 'Nurse Station',
      role: 'NURSE',
      isActive: true,
    },
  })
  console.log('✅ Created Nurse user')

  // Create Lab User
  const lab = await prisma.user.upsert({
    where: { email: 'lab@hospital.com' },
    update: {},
    create: {
      email: 'lab@hospital.com',
      password: hashedPassword,
      name: 'Laboratory Technician',
      role: 'LAB',
      isActive: true,
    },
  })
  console.log('✅ Created Lab user')

  // Create Radiology User
  const radiology = await prisma.user.upsert({
    where: { email: 'radiology@hospital.com' },
    update: {},
    create: {
      email: 'radiology@hospital.com',
      password: hashedPassword,
      name: 'Radiology Technician',
      role: 'RADIOLOGY',
      isActive: true,
    },
  })
  console.log('✅ Created Radiology user')

  // Create Doctor User
  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      email: 'doctor@hospital.com',
      password: hashedPassword,
      name: 'Dr. Medical Officer',
      role: 'DOCTOR',
      isActive: true,
    },
  })
  console.log('✅ Created Doctor user')

  // Create MCU Packages
  const basicPackage = await prisma.mCUPackage.upsert({
    where: { code: 'BASIC' },
    update: {},
    create: {
      name: 'Basic Health Checkup',
      code: 'BASIC',
      description: 'Essential health screening for all employees',
      isActive: true,
      steps: {
        create: [
          {
            department: 'NURSING',
            stepName: 'Vital Signs',
            stepOrder: 1,
            isRequired: true,
            instructions: 'Measure BP, HR, Weight, Height, BMI',
          },
          {
            department: 'LABORATORY',
            stepName: 'Complete Blood Count',
            stepOrder: 2,
            isRequired: true,
            instructions: 'Hb, Leukocyte, Erythrocyte, Platelet, Hematocrit',
          },
          {
            department: 'GENERAL_DOCTOR',
            stepName: 'General Examination',
            stepOrder: 3,
            isRequired: true,
            instructions: 'Physical examination and final assessment',
          },
        ],
      },
    },
  })
  console.log('✅ Created Basic Package')

  const executivePackage = await prisma.mCUPackage.upsert({
    where: { code: 'EXECUTIVE' },
    update: {},
    create: {
      name: 'Executive Checkup',
      code: 'EXECUTIVE',
      description: 'Comprehensive health screening for executives',
      isActive: true,
      steps: {
        create: [
          {
            department: 'NURSING',
            stepName: 'Vital Signs',
            stepOrder: 1,
            isRequired: true,
            instructions: 'Measure BP, HR, Weight, Height, BMI, Vision Test',
          },
          {
            department: 'LABORATORY',
            stepName: 'Complete Blood Count',
            stepOrder: 2,
            isRequired: true,
            instructions: 'CBC, Blood Glucose, Cholesterol, Uric Acid',
          },
          {
            department: 'LABORATORY',
            stepName: 'Urinalysis',
            stepOrder: 3,
            isRequired: true,
            instructions: 'Complete urine analysis',
          },
          {
            department: 'RADIOLOGY',
            stepName: 'Chest X-Ray',
            stepOrder: 4,
            isRequired: true,
            instructions: 'PA view chest radiograph',
          },
          {
            department: 'GENERAL_DOCTOR',
            stepName: 'General Examination',
            stepOrder: 5,
            isRequired: true,
            instructions: 'Complete physical examination and final assessment',
          },
        ],
      },
    },
  })
  console.log('✅ Created Executive Package')

  const preEmploymentPackage = await prisma.mCUPackage.upsert({
    where: { code: 'PRE_EMPLOYMENT' },
    update: {},
    create: {
      name: 'Pre-Employment Checkup',
      code: 'PRE_EMPLOYMENT',
      description: 'Standard pre-employment health screening',
      isActive: true,
      steps: {
        create: [
          {
            department: 'NURSING',
            stepName: 'Vital Signs',
            stepOrder: 1,
            isRequired: true,
            instructions: 'Measure BP, HR, Weight, Height',
          },
          {
            department: 'LABORATORY',
            stepName: 'Drug Test',
            stepOrder: 2,
            isRequired: true,
            instructions: 'Urine drug screening',
          },
          {
            department: 'RADIOLOGY',
            stepName: 'Chest X-Ray',
            stepOrder: 3,
            isRequired: true,
            instructions: 'PA view chest radiograph for TB screening',
          },
          {
            department: 'GENERAL_DOCTOR',
            stepName: 'Fit for Work Assessment',
            stepOrder: 4,
            isRequired: true,
            instructions: 'Determine fitness for employment',
          },
        ],
      },
    },
  })
  console.log('✅ Created Pre-Employment Package')

  console.log('🎉 Seeding completed!')
  console.log('\n📋 Demo Credentials:')
  console.log('   admin@hospital.com / admin123')
  console.log('   nurse@hospital.com / admin123')
  console.log('   lab@hospital.com / admin123')
  console.log('   radiology@hospital.com / admin123')
  console.log('   doctor@hospital.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
