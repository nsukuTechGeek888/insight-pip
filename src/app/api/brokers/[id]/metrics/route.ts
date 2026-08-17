import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateBrokerMetrics } from '@/lib/incident-metrics';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brokerId = parseInt(id);
    
    if (isNaN(brokerId)) {
      return NextResponse.json(
        { error: 'Invalid broker ID' },
        { status: 400 }
      );
    }

    console.log(`📊 Manually updating metrics for broker ${brokerId}`);
    
    const metrics = await updateBrokerMetrics(brokerId);

    return NextResponse.json({
      success: true,
      message: 'Broker metrics updated successfully',
      metrics
    });

  } catch (error) {
    console.error('Error updating broker metrics:', error);
    return NextResponse.json(
      { error: 'Failed to update broker metrics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}