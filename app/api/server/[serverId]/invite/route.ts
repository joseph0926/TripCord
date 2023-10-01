import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/actions/user';

export const PATCH = async (req: Request, { params }: { params: { serverId: string } }) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!params.serverId) {
      return new NextResponse('Server ID Missing', { status: 400 });
    }

    const server = await db.server.update({
      where: {
        id: params.serverId,
        userId: user.id
      },
      data: {
        inviteCode: uuidv4()
      }
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log('[SERVER_ID]', error);
    return new NextResponse('Server Error', { status: 500 });
  }
};
