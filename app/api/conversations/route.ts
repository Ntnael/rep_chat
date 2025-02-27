import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// Get all conversations for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(auth);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching conversations" },
      { status: 500 }
    );
  }
}

// Create a new conversation
export async function POST(request: Request) {
  try {
    const session = await getServerSession(auth);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title } = body;

    // Create a new conversation
    const conversation = await prisma.conversation.create({
      data: {
        title: title || "New Conversation",
        participants: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Add initial AI message
    await prisma.message.create({
      data: {
        content: "Hello! How can I assist you today?",
        role: "assistant",
        userId: session.user.id,
        conversationId: conversation.id,
      },
    });

    return NextResponse.json(
      { conversation, message: "Conversation created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the conversation" },
      { status: 500 }
    );
  }
} 