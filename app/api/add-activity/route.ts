import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate request body fields
    const { participant_id, activity_name, description } = body;

    if (!participant_id || typeof participant_id !== 'string') {
      return NextResponse.json(
        { error: 'participant_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (!activity_name || typeof activity_name !== 'string') {
      return NextResponse.json(
        { error: 'activity_name is required and must be a string' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'description is required and must be a string' },
        { status: 400 }
      );
    }

    // Look up the participant from participants_data - get all fields
    const { data: participant, error: participantError } = await supabase
      .from('participants_data')
      .select('*')
      .eq('participant_id', participant_id)
      .single();

    // Handle participant not found
    if (participantError || !participant) {
      return NextResponse.json(
        { 
          error: 'Participant not found',
          details: participantError?.message || 'No participant found with the provided ID'
        },
        { status: 404 }
      );
    }

    // Check if this activity already exists for this participant
    const { data: existingActivity, error: existingActivityError } = await supabase
      .from('participant_activity')
      .select('id')
      .eq('participant_id', participant_id)
      .eq('activity_name', activity_name)
      .maybeSingle();

    // If activity already exists, return a 409 Conflict response
    if (existingActivity) {
      return NextResponse.json(
        { 
          error: 'Activity already exists',
          details: `${activity_name} has already been recorded for participant ${participant_id}`
        },
        { status: 409 }
      );
    }
    
    // If there was an error checking for existing activity (but not "not found" error)
    if (existingActivityError && !existingActivityError.message.includes('No rows found')) {
      console.error('Error checking for existing activity:', existingActivityError);
      return NextResponse.json(
        { 
          error: 'Failed to check for existing activity',
          details: existingActivityError.message
        },
        { status: 500 }
      );
    }

    // Insert a new row into the participant_activity table
    const { error: insertError } = await supabase
      .from('participant_activity')
      .insert({
        participant_id,
        activity_name,
        description,
        name: participant.candidate_name,
        email: participant.candidate_email,
        // created_at will be automatically handled by Supabase
      });

    // Handle insertion error
    if (insertError) {
      console.error('Error inserting activity:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to add activity',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    // Fetch the most recent 3 activities for this participant
    const { data: recentActivity, error: activityError } = await supabase
      .from('participant_activity')
      .select('activity_name, description, created_at')
      .eq('participant_id', participant_id)
      .order('created_at', { ascending: false })
      .limit(3);

    // Log but don't fail if there's an error fetching recent activities
    if (activityError) {
      console.error('Error fetching recent activities:', activityError);
    }
    
    // Return success response with full participant details
    return NextResponse.json(
      {
        participant,
        recent_activity: recentActivity || []
      },
      { status: 200 }
    );

  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle all other HTTP methods
export async function GET() {
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
