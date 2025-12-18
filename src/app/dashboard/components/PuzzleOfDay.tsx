'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { getDailyPuzzle } from '@/lib/actions/puzzles';
import { Puzzle } from '@/lib/types/puzzle';

const PuzzleOfDay = () => {
  const t = useTranslations();
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle | null | undefined>(
    null
  );

  useEffect(() => {
    const _getDailyPuzzle = async () => {
      const { data: puzzle } = await getDailyPuzzle();
      setDailyPuzzle(puzzle);
    };

    _getDailyPuzzle();
  }, []);

  if (!dailyPuzzle)
    return <div>FAILED TO LOAD -- TODO: MAKE DEDICATED COMPONENT</div>;

  return (
    <Link
      href={`/puzzle/${dailyPuzzle.slug}`}
      className="bento-box__area-1 bg-base-300 rounded-lg p-4 shadow-md cursor-pointer transform transition-transform hover:scale-[1.02] hover:shadow-lg"
    >
      <h1 className="text-2xl font-bold uppercase mb-2">
        {t('dashboard.image_of_the_day')}
      </h1>
      <div className="relative w-full h-3/4 rounded-lg overflow-hidden mb-2">
        <Image
          src={dailyPuzzle.url}
          alt={dailyPuzzle.title}
          objectFit="cover"
        />
      </div>
      <p>{dailyPuzzle.title}</p>
      <p>{dailyPuzzle.attribution.photographer}</p>
      <p>{dailyPuzzle.attribution.source}</p>
    </Link>
  );
};

export default PuzzleOfDay;
