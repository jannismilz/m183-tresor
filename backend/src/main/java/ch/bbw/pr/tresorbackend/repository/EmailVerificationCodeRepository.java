package ch.bbw.pr.tresorbackend.repository;

import ch.bbw.pr.tresorbackend.model.EmailVerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationCodeRepository extends JpaRepository<EmailVerificationCode, Long> {
    
    Optional<EmailVerificationCode> findByUserIdAndCodeAndUsedFalse(Long userId, String code);
    
    @Query("SELECT e FROM EmailVerificationCode e WHERE e.userId = :userId AND e.used = false ORDER BY e.createdAt DESC")
    Optional<EmailVerificationCode> findLatestActiveByUserId(@Param("userId") Long userId);
}
