<?php

namespace Tests\Unit;

use App\Models\Tournament;
use App\Services\KnockoutBracketService;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class KnockoutBracketServiceTest extends TestCase
{
    public function test_it_uses_four_rounds_for_a_16_participant_bracket(): void
    {
        $this->assertSame([
            Tournament::STAGE_QUALIFIER,
            Tournament::STAGE_ROUND_2,
            Tournament::STAGE_SEMI_FINAL,
            Tournament::STAGE_FINAL,
        ], (new KnockoutBracketService())->stagesForSize(16));
    }

    public function test_it_uses_five_rounds_for_a_32_participant_bracket(): void
    {
        $this->assertSame([
            Tournament::STAGE_QUALIFIER,
            Tournament::STAGE_ROUND_2,
            Tournament::STAGE_ROUND_3,
            Tournament::STAGE_SEMI_FINAL,
            Tournament::STAGE_FINAL,
        ], (new KnockoutBracketService())->stagesForSize(32));
    }

    public function test_it_rejects_unsupported_bracket_sizes(): void
    {
        $this->expectException(ValidationException::class);

        (new KnockoutBracketService())->stagesForSize(8);
    }
}
