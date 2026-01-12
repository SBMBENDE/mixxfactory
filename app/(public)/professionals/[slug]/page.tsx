/**
 * Professional detail page
 */

import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db/connection';
import { ProfessionalModel } from '@/lib/db/models';
import ProfessionalDetailClient from '@/components/ProfessionalDetailClient';

interface Props {
  params: { slug: string };
}

export default async function ProfessionalPage({ params }: Props) {
  try {
    await connectDB();

    const professional = await ProfessionalModel.findOne({
      slug: params.slug,
      active: true,
    }).populate('category');

    if (!professional) {
      notFound();
    }

    const professionalData = professional.toObject ? professional.toObject() : JSON.parse(JSON.stringify(professional));

    // Convert availability Map to plain object if it exists
    if (professionalData.availability && professionalData.availability instanceof Map) {
      professionalData.availability = Object.fromEntries(professionalData.availability);
    } else if (professionalData.availability && typeof professionalData.availability === 'object' && '$type' in professionalData.availability) {
      // Handle Mongoose Map serialization
      professionalData.availability = {};
    }

    return <ProfessionalDetailClient professional={professionalData} />;
  } catch (error) {
    console.error('Error loading professional:', error);
    notFound();
  }
}
