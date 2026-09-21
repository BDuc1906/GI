import { NextRequest, NextResponse } from 'next/server';
import { getGameIcon, getToolIcon, getSpiralAbyssImage } from '@/lib/game/genshin-icons';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;

  let iconUrl = '';

  try {
    switch (category) {
      case 'characters':
      case 'weapons':
      case 'artifacts':
      case 'materials':
      case 'domains':
      case 'enemies':
        iconUrl = await getGameIcon(category);
        break;
      case 'calendar':
      case 'tierlist':
      case 'calculator':
      case 'optimizer':
        iconUrl = await getToolIcon(category);
        break;
      case 'spiral-abyss':
        iconUrl = await getSpiralAbyssImage();
        break;
      default:
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    // Luôn trả về iconUrl (kể cả rỗng) để client-side có thể fallback
    return NextResponse.json({ iconUrl });
  } catch (error) {
    console.error('Error fetching icon:', error);
    return NextResponse.json({ iconUrl: '' }, { status: 500 });
  }
}