import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch all participant activities from the participant_activity table
    const { data: activities, error: activitiesError } = await supabase
      .from('participant_activity')
      .select('*')
      .order('created_at', { ascending: false });

    // Handle database error
    if (activitiesError) {
      console.error('Error fetching participant activities:', activitiesError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch participant activities',
          details: activitiesError.message
        },
        { status: 500 }
      );
    }

    // Return success response with all participant activities
    return NextResponse.json({
      activities: activities || [],
      total_count: activities?.length || 0
    }, { status: 200 });

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in participants-activity route:', error);
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
