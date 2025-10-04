package com.example.coby.dto;

import com.example.coby.entity.User;
import com.example.coby.entity.Tier;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Data
@Getter
@Setter
public class RankingDto {
    private String nickName;
    private Tier tier;
    private Integer tierPoint;
    private String email;
    private Integer winGame;
    private Integer totalGame;
    private String preferredLanguage;

    public RankingDto(String nickName, Tier tier, Integer tierPoint, String email, Integer winGame, Integer totalGame, String preferredLanguage) {
        this.nickName = nickName;
        this.tier = tier;
        this.tierPoint = tierPoint;
        this.email = email;
        this.winGame = winGame;
        this.totalGame = totalGame;
        this.preferredLanguage = preferredLanguage;
    }

    public static RankingDto fromEntity(User user) {
        return new RankingDto(
                user.getNickname(),
                user.getTier(),
                user.getTierPoint(),
                user.getEmail(),
                user.getWinGame(),
                user.getTotalGame(),
                user.getPreferredLanguage()
        );
    }
}
