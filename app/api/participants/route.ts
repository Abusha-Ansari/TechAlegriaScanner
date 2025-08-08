import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all participants from the participants_data table
    const { data: participants, error: participantsError } = await supabase
      .from('participants_data')
      .select('*')
      .order('participant_id', { ascending: true });

    // Handle database error
    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch participants',
          details: participantsError.message
        },
        { status: 500 }
      );
    }

    // Return success response with all participants
    return NextResponse.json({
      participants: participants || [],
      total_count: participants?.length || 0
    }, { status: 200 });

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in participants route:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handlers for rejecting non-GET methods with 405 Method Not Allowed
export async function POST() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
