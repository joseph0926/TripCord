import { getCurrentUser } from '@/lib/actions/user/fetchActions';
import db from '@/lib/db';
import { ChannelType, MemberRole } from '@prisma/client';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  try {
    const user = await getCurrentUser();
    const { name, type } = await req.json();
    const { searchParams } = new URL(req.url);
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const serverId = searchParams.get('serverId');
    if (!serverId) {
      return new NextResponse('Server ID is missing', { status: 400 });
    }

    if (name === 'general') {
      return new NextResponse("Name cannot be 'general'", { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            userId: user,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR]
            }
          }
        }
      },
      data: {
        channels: {
          create: {
            userId: user,
            name,
            type
          }
        }
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log('[CHANNEL_POST]', error);
    return new NextResponse('Server Error', { status: 500 });
  }
};
