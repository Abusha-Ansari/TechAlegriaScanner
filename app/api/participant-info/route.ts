import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Parse the participant_id from the URL query parameters
    const searchParams = request.nextUrl.searchParams;
    const participantId = searchParams.get('participant_id');

    // Validate participant_id exists in the query string
    if (!participantId) {
      return NextResponse.json(
        { error: 'Missing participant_id query parameter' },
        { status: 400 }
      );
    }

    // Fetch the participant data
    const { data: participant, error: participantError } = await supabase
      .from('participants_data')
      .select('participant_id, candidate_name, candidate_email, team_id, team_name, candidate_role')
      .eq('participant_id', participantId)
      .single();

    // Return 404 if participant not found
    if (participantError || !participant) {
      return NextResponse.json(
        { 
          error: 'Participant not found',
          details: participantError?.message || `No participant found with ID: ${participantId}`
        },
        { status: 404 }
      );
    }

    // Fetch the most recent 3 activities for this participant
    const { data: recentActivity, error: activityError } = await supabase
      .from('participant_activity')
      .select('activity_name, description, created_at')
      .eq('participant_id', participantId)
      .order('created_at', { ascending: false })
      .limit(3);

    // Handle activity fetch error (but don't fail the whole request)
    if (activityError) {
      console.error('Error fetching recent activities:', activityError);
    }

    // Construct and return the response
    return NextResponse.json({
      participant,
      recent_activity: recentActivity || []
    }, { status: 200 });

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in participant-info route:', error);
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
