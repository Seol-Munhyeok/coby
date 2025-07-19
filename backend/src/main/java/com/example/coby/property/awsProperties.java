package com.example.coby.property;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Getter
@Setter
@ConfigurationProperties(prefix = "aws")
public class awsProperties {
    private S3 s3 = new S3();
    private Sqs sqs = new Sqs();

    @Getter
    @Setter
    public static class S3 {
        private String bucket;
    }

    @Getter
    @Setter
    public static class Sqs {
        private Queue queue = new Queue();

        @Getter
        @Setter
        public static class Queue {
            private String url;
        }
    }
}
